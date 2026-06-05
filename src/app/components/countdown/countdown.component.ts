import { Component, OnDestroy, OnInit } from '@angular/core';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.css',
})
export class CountdownComponent implements OnInit, OnDestroy {
  private readonly target = new Date('2026-11-21T00:00:00');
  private intervalId?: ReturnType<typeof setInterval>;

  time: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  units = [
    { key: 'days' as const, label: 'Días' },
    { key: 'hours' as const, label: 'Horas' },
    { key: 'minutes' as const, label: 'Minutos' },
    { key: 'seconds' as const, label: 'Segundos' },
  ];

  ngOnInit(): void {
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private tick(): void {
    const diff = this.target.getTime() - Date.now();
    if (diff <= 0) {
      this.time = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }
    this.time = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  pad(value: number): string {
    return String(value).padStart(2, '0');
  }
}
