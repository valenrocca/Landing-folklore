import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RegisterModalComponent } from '../../components/register-modal/register-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RegisterModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  showRegister = false;

  ngOnInit(): void {
    this.showRegister = environment.registrationGateEnabled;
  }

  openRegister(): void {
    this.showRegister = true;
  }

  onRegisterSubmit(): void {
    this.showRegister = false;
  }
}
