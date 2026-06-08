import { Component } from '@angular/core';
import { CountdownComponent } from '../../components/countdown/countdown.component';
import {
  RegisterFormData,
  RegisterModalComponent,
} from '../../components/register-modal/register-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CountdownComponent, RegisterModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  showRegister = false;

  openRegister(): void {
    this.showRegister = true;
  }

  closeRegister(): void {
    this.showRegister = false;
  }

  onRegisterSubmit(_data: RegisterFormData): void {
    this.closeRegister();
  }
}
