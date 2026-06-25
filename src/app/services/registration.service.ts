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
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        return;
      }

      const payload = await response.json().catch(() => ({}));
      console.error('API register failed', response.status, payload);
    } catch (error) {
      console.error('API register unreachable', error);
    }

    await this.registerLocally(data);
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
}
