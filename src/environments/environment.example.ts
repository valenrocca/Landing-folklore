export const environment = {
  production: false,
  /** Credenciales de Supabase para guardar registros desde el frontend. */
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
  /**
   * Sync a Typeform via /api/register — deshabilitado en registration.service.ts.
   * Para reactivar: descomentar syncToTypeform, restaurar /api en proxy.conf.json
   * y correr `npm run dev:api` en otra terminal junto con `npm start`.
   */
  registrationGateEnabled: true,
};
