import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

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

  private async registerLocally(data: RegisterFormData): Promise<void> {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    const { error } = await supabase.from('registrations').insert({
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
    });

    if (error) {
      throw error;
    }
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
