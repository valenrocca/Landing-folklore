import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

export interface RegistrationPayload {
  nombre: string;
  apellido: string;
  email: string;
}

interface TypeformField {
  id: string;
  title: string;
  type: string;
  ref?: string;
}

interface TypeformAnswer {
  type: string;
  text?: string;
  email?: string;
  field: { id?: string; ref?: string; type?: string };
}

const FIELD_ALIASES: Record<keyof RegistrationPayload, string[]> = {
  nombre: ['nombre', 'name', 'first'],
  apellido: ['apellido', 'apellidos', 'last', 'surname'],
  email: ['email', 'mail', 'correo'],
};

let cachedFieldMap: Map<keyof RegistrationPayload, TypeformField> | null = null;

function getSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function validateRegistrationPayload(
  body: unknown
): RegistrationPayload | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const { nombre, apellido, email } = body as Record<string, unknown>;

  if (
    typeof nombre !== 'string' ||
    typeof apellido !== 'string' ||
    typeof email !== 'string'
  ) {
    return null;
  }

  const payload = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: email.trim().toLowerCase(),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    payload.nombre.length < 2 ||
    payload.apellido.length < 2 ||
    !emailPattern.test(payload.email)
  ) {
    return null;
  }

  return payload;
}

export async function saveToSupabase(
  payload: RegistrationPayload
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('registrations').insert({
    nombre: payload.nombre,
    apellido: payload.apellido,
    email: payload.email,
  });

  if (error) {
    throw error;
  }
}

function matchField(
  fields: TypeformField[],
  aliases: string[]
): TypeformField | undefined {
  return fields.find((field) => {
    const haystack = normalize(`${field.title} ${field.ref ?? ''}`);
    return aliases.some((alias) => haystack.includes(alias));
  });
}

async function getTypeformFieldMap(): Promise<
  Map<keyof RegistrationPayload, TypeformField>
> {
  if (cachedFieldMap) {
    return cachedFieldMap;
  }

  const token = process.env.TYPEFORM_API_TOKEN;
  const formId = process.env.TYPEFORM_FORM_ID || 'DxHVf2L2';

  if (!token) {
    throw new Error('Missing TYPEFORM_API_TOKEN');
  }

  const response = await fetch(`https://api.typeform.com/forms/${formId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Typeform form lookup failed (${response.status})`);
  }

  const form = (await response.json()) as { fields?: TypeformField[] };
  const fields = form.fields ?? [];
  const map = new Map<keyof RegistrationPayload, TypeformField>();

  (Object.keys(FIELD_ALIASES) as Array<keyof RegistrationPayload>).forEach(
    (key) => {
      const field = matchField(fields, FIELD_ALIASES[key]);
      if (field) {
        map.set(key, field);
      }
    }
  );

  if (!map.has('email')) {
    throw new Error('Typeform form is missing an email field');
  }

  cachedFieldMap = map;
  return map;
}

function buildTypeformAnswer(
  field: TypeformField,
  value: string
): Record<string, unknown> {
  if (field.type === 'email') {
    return {
      field: { id: field.id },
      type: 'email',
      email: value,
    };
  }

  return {
    field: { id: field.id },
    type: 'short_text',
    text: value,
  };
}

export async function syncToTypeform(
  payload: RegistrationPayload
): Promise<void> {
  const token = process.env.TYPEFORM_API_TOKEN;
  const formId = process.env.TYPEFORM_FORM_ID || 'DxHVf2L2';

  if (!token) {
    return;
  }

  const fieldMap = await getTypeformFieldMap();
  const answers: Record<string, unknown>[] = [];

  (Object.keys(payload) as Array<keyof RegistrationPayload>).forEach((key) => {
    const field = fieldMap.get(key);
    if (field) {
      answers.push(buildTypeformAnswer(field, payload[key]));
    }
  });

  if (answers.length === 0) {
    throw new Error('No matching Typeform fields for registration payload');
  }

  const response = await fetch(
    `https://api.typeform.com/forms/${formId}/responses`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Typeform response sync failed (${response.status}): ${details}`);
  }
}

function readAnswerValue(answer: TypeformAnswer): string {
  if (answer.type === 'email' && answer.email) {
    return answer.email;
  }

  return answer.text?.trim() ?? '';
}

function resolveFieldKey(
  answer: TypeformAnswer,
  fieldsById: Map<string, TypeformField>
): keyof RegistrationPayload | null {
  const fieldId = answer.field.id;
  const fieldRef = answer.field.ref;
  const field = fieldId ? fieldsById.get(fieldId) : undefined;
  const label = normalize(`${field?.title ?? ''} ${fieldRef ?? ''}`);

  if (FIELD_ALIASES.email.some((alias) => label.includes(alias))) {
    return 'email';
  }

  if (FIELD_ALIASES.apellido.some((alias) => label.includes(alias))) {
    return 'apellido';
  }

  if (FIELD_ALIASES.nombre.some((alias) => label.includes(alias))) {
    return 'nombre';
  }

  return null;
}

export async function payloadFromTypeformWebhook(
  body: unknown
): Promise<RegistrationPayload | null> {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const formResponse = (body as { form_response?: unknown }).form_response;
  if (!formResponse || typeof formResponse !== 'object') {
    return null;
  }

  const answers = (formResponse as { answers?: TypeformAnswer[] }).answers ?? [];
  const definition = (formResponse as {
    definition?: { fields?: TypeformField[] };
  }).definition;
  const fieldsById = new Map(
    (definition?.fields ?? []).map((field) => [field.id, field])
  );

  const payload: Partial<RegistrationPayload> = {};

  answers.forEach((answer) => {
    const key = resolveFieldKey(answer, fieldsById);
    const value = readAnswerValue(answer);
    if (key && value) {
      payload[key] = value;
    }
  });

  return validateRegistrationPayload(payload);
}

export function verifyTypeformSignature(
  rawBody: string,
  signatureHeader: string | undefined
): boolean {
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;

  if (!secret || !signatureHeader) {
    return false;
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('base64');
  const received = signatureHeader.replace(/^sha256=/, '');

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}
