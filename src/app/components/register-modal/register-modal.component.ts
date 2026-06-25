import { Component, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrl: './register-modal.component.css',
})
export class RegisterModalComponent {
  registrationSuccess = output<void>();

  form: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly registrationService: RegistrationService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });
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
    } catch {
      this.submitError =
        'No se pudo completar el registro. Intentá de nuevo.';
    } finally {
      this.isSubmitting = false;
    }
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
