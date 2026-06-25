import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-video-background',
  standalone: true,
  templateUrl: './video-background.component.html',
  styleUrl: './video-background.component.css',
})
export class VideoBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgVideo') bgVideo?: ElementRef<HTMLVideoElement>;

  readonly videoSrc = 'assets/video/background.mp4';

  private readonly onVisibilityChange = () => this.tryPlay();

  ngAfterViewInit(): void {
    const video = this.bgVideo?.nativeElement;
    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    video.addEventListener('canplay', this.onVisibilityChange);
    video.addEventListener('ended', this.restartLoop);
    video.addEventListener('pause', this.onVisibilityChange);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.tryPlay();
  }

  ngOnDestroy(): void {
    const video = this.bgVideo?.nativeElement;
    if (video) {
      video.removeEventListener('canplay', this.onVisibilityChange);
      video.removeEventListener('ended', this.restartLoop);
      video.removeEventListener('pause', this.onVisibilityChange);
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private readonly restartLoop = () => {
    const video = this.bgVideo?.nativeElement;
    if (!video) {
      return;
    }
    video.currentTime = 0;
    this.tryPlay();
  };

  private tryPlay(): void {
    const video = this.bgVideo?.nativeElement;
    if (!video || document.hidden) {
      return;
    }

    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        // Algunos navegadores bloquean el autoplay hasta una interacción;
        // reintentamos en el próximo evento de canplay/visibilidad.
      });
    }
  }
}
