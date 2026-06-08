import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { RegisterFormData } from '../components/register-modal/register-modal.component';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  async register(data: RegisterFormData): Promise<void> {
    const { error } = await this.supabase.from('registrations').insert({
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      email: data.email,
    });

    if (error) {
      throw error;
    }
  }
}
