import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { createWidget } from '@typeform/embed';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  templateUrl: './register-modal.component.html',
  styleUrl: './register-modal.component.css',
})
export class RegisterModalComponent implements AfterViewInit, OnDestroy {
  @Output() submitted = new EventEmitter<void>();
  @ViewChild('typeformContainer', { static: true })
  typeformContainer!: ElementRef<HTMLElement>;

  submitSuccess = false;

  private unmount?: () => void;

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    const { unmount } = createWidget(environment.typeformFormId, {
      container: this.typeformContainer.nativeElement,
      domain: environment.typeformDomain,
      hideHeaders: true,
      inlineOnMobile: true,
      autoResize: true,
      opacity: 0,
      onSubmit: () => {
        this.ngZone.run(() => {
          this.submitSuccess = true;
          setTimeout(() => this.submitted.emit(), 1500);
        });
      },
    });

    this.unmount = unmount;
  }

  ngOnDestroy(): void {
    this.unmount?.();
  }
}
