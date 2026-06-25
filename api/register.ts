import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  saveToSupabase,
  syncToTypeform,
  validateRegistrationPayload,
} from './lib/registration';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = validateRegistrationPayload(req.body);

  if (!payload) {
    res.status(400).json({ error: 'Invalid registration data' });
    return;
  }

  try {
    await saveToSupabase(payload);
  } catch (error) {
    console.error('Supabase insert failed', error);
    res.status(500).json({ error: 'Could not save registration' });
    return;
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
