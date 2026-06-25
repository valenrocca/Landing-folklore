import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RegistrationError, toRegistrationError } from './registration.errors';

export interface RegisterFormData {
  nombre: string;
  apellido: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  async register(data: RegisterFormData): Promise<void> {
    await this.registerLocally(data);

    // Typeform sync via /api/register — deshabilitado para evitar errores en consola local.
    // Para reactivar: descomentar la línea de abajo y restaurar el proxy en proxy.conf.json.
    // void this.syncToTypeform(data);
  }

  async isEmailRegistered(email: string): Promise<boolean> {
    const supabase = await this.createClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from('registrations')
      .select('email')
      .eq('email', normalizedEmail)
      .limit(1);

    if (error) {
      throw toRegistrationError(error);
    }

    return (data?.length ?? 0) > 0;
  }

  private async registerLocally(data: RegisterFormData): Promise<void> {
    const supabase = await this.createClient();

    const payload = {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      email: data.email.trim().toLowerCase(),
    };

    const { error } = await supabase.from('registrations').insert(payload);

    if (error) {
      throw toRegistrationError(error);
    }
  }

  private async createClient() {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // private async syncToTypeform(data: RegisterFormData): Promise<void> {
  //   try {
  //     await fetch('/api/register', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ ...data, skipSupabase: true }),
  //     });
  //   } catch {
  //     // Typeform sync is best-effort; Supabase already saved the registration.
  //   }
  // }
}

export { RegistrationError };
