import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RegisterModalComponent } from '../../components/register-modal/register-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RegisterModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  showRegister = false;
  registrationComplete = false;
  private successCloseTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.showRegister = environment.registrationGateEnabled;
  }

  ngOnDestroy(): void {
    if (this.successCloseTimer !== null) {
      clearTimeout(this.successCloseTimer);
    }
  }

  openRegister(): void {
    this.showRegister = true;
  }

  onRegistrationSuccess(): void {
    this.registrationComplete = true;
    this.successCloseTimer = setTimeout(() => {
      this.showRegister = false;
      this.successCloseTimer = null;
    }, 1000);
  }
}
