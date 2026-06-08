import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';

export interface RegisterFormData {
  nombre: string;
  apellido: string;
  dni: number;
  email: string;
}

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrl: './register-modal.component.css',
})
export class RegisterModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<RegisterFormData>();

  form: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isSubmitting) {
      this.close();
    }
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isSubmitting) {
      this.close();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    const { nombre, apellido, dni, email } = this.form.getRawValue();
    const data: RegisterFormData = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: Number(dni),
      email: email.trim(),
    };

    try {
      await this.registrationService.register(data);
      this.submitSuccess = true;
      this.submitted.emit(data);
      this.form.reset();
      setTimeout(() => this.close(), 1500);
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
