import { Component, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';
import { RegistrationError } from '../../services/registration.errors';

type RegisterMode = 'register' | 'login';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrl: './register-modal.component.css',
})
export class RegisterModalComponent {
  registrationSuccess = output<void>();

  mode: RegisterMode = 'register';

  form: FormGroup;
  loginForm: FormGroup;

  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  loginError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly registrationService: RegistrationService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  showLogin(): void {
    this.mode = 'login';
    this.submitError = '';
    this.loginError = '';
  }

  showRegister(): void {
    this.mode = 'register';
    this.loginError = '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const { nombre, apellido, email } = this.form.getRawValue();

    try {
      await this.registrationService.register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
      });
      this.submitSuccess = true;
      this.registrationSuccess.emit();
    } catch (error) {
      this.submitError =
        error instanceof RegistrationError
          ? error.message
          : 'No se pudo completar el registro. Intentá de nuevo.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginError = '';

    const { email } = this.loginForm.getRawValue();

    try {
      const registered = await this.registrationService.isEmailRegistered(
        email.trim()
      );

      if (registered) {
        this.submitSuccess = true;
        this.registrationSuccess.emit();
      } else {
        this.loginError = 'Este email no está registrado.';
      }
    } catch {
      this.loginError = 'No se pudo verificar el email. Intentá de nuevo.';
    } finally {
      this.isSubmitting = false;
    }
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  hasLoginError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
