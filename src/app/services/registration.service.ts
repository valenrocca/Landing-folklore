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
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return;
    }

    if (!environment.production) {
      await this.registerLocally(data);
      return;
    }

    throw new Error('Registration failed');
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

    console.warn(
      'Registro guardado solo en Supabase (local). Para sincronizar con Typeform usá: npx vercel dev'
    );
  }
}
