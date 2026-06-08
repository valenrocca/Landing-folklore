import { Component } from '@angular/core';

@Component({
  selector: 'app-video-background',
  standalone: true,
  templateUrl: './video-background.component.html',
  styleUrl: './video-background.component.css',
})
export class VideoBackgroundComponent {
  readonly videoSrc = 'assets/video/background.mp4';
}
