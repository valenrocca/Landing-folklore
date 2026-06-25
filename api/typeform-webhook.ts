import {
  payloadFromTypeformWebhook,
  saveToSupabase,
  verifyTypeformSignature,
} from './lib/registration';

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  [Symbol.asyncIterator]?: () => AsyncIterableIterator<Buffer | string>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: ApiRequest): Promise<string> {
  const chunks: Buffer[] = [];

  if (req[Symbol.asyncIterator]) {
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
  }

  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers['typeform-signature'] as string | undefined;

  if (!verifyTypeformSignature(rawBody, signature)) {
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: 'Invalid JSON payload' });
    return;
  }

  const payload = await payloadFromTypeformWebhook(body);

  if (!payload) {
    res.status(400).json({ error: 'Could not map Typeform answers' });
    return;
  }

  try {
    await saveToSupabase(payload);
  } catch (error) {
    console.error('Webhook Supabase insert failed', error);
    res.status(500).json({ error: 'Could not save registration' });
    return;
  }

  res.status(200).json({ ok: true });
}
