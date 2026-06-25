export type RegistrationErrorCode = 'duplicate_email' | 'unknown';

export class RegistrationError extends Error {
  readonly code: RegistrationErrorCode;

  constructor(message: string, code: RegistrationErrorCode) {
    super(message);
    this.name = 'RegistrationError';
    this.code = code;
  }
}

export function toRegistrationError(error: unknown): RegistrationError {
  if (error instanceof RegistrationError) {
    return error;
  }

  if (isDuplicateEmailError(error)) {
    return new RegistrationError(
      'Este email ya está registrado.',
      'duplicate_email'
    );
  }

  return new RegistrationError(
    'No se pudo completar el registro. Intentá de nuevo.',
    'unknown'
  );
}

function isDuplicateEmailError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const { code, message } = error as { code?: string; message?: string };

  if (code === '23505') {
    return true;
  }

  return (
    typeof message === 'string' &&
    (message.includes('registrations_email_unique_idx') ||
      message.toLowerCase().includes('duplicate key'))
  );
}
