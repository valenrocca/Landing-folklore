/**
 * POST /api/register — sync a Typeform (y opcionalmente Supabase server-side).
 * Deshabilitado desde el frontend (registration.service.ts). El endpoint sigue
 * disponible en producción/Vercel para cuando se reactive.
 */
import {
  saveToSupabase,
  syncToTypeform,
  validateRegistrationPayload,
} from './lib/registration';

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const skipSupabase =
    req.body &&
    typeof req.body === 'object' &&
    (req.body as { skipSupabase?: boolean }).skipSupabase === true;

  const payload = validateRegistrationPayload(
    skipSupabase
      ? {
          nombre: (req.body as Record<string, unknown>).nombre,
          apellido: (req.body as Record<string, unknown>).apellido,
          email: (req.body as Record<string, unknown>).email,
        }
      : req.body
  );

  if (!payload) {
    res.status(400).json({ error: 'Invalid registration data' });
    return;
  }

  if (!skipSupabase) {
    try {
      await saveToSupabase(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Supabase error';
      const supabaseCode =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : undefined;

      console.error('Supabase insert failed', error);
      res.status(500).json({
        error: 'Could not save registration',
        details: message,
        code: supabaseCode,
      });
      return;
    }
  }

  try {
    await syncToTypeform(payload);
  } catch (error) {
    console.error('Typeform sync failed', error);
    res.status(201).json({
      ok: true,
      syncedToTypeform: false,
    });
    return;
  }

  res.status(201).json({ ok: true, syncedToTypeform: true });
}
