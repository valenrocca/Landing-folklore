-- Evita registros duplicados por email (case-insensitive).
-- Ejecutar en Supabase: SQL Editor → New query → Run.

UPDATE public.registrations
SET email = lower(trim(email))
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS registrations_email_unique_idx
  ON public.registrations (lower(trim(email)));
