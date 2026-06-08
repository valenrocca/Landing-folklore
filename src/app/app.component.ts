import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { VideoBackgroundComponent } from './components/video-background/video-background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    VideoBackgroundComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  host: {
    '[class.home-page]': 'isHome',
  },
})
export class AppComponent {
  isHome = true;

  constructor(private router: Router) {
    this.isHome = this.checkHome(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.isHome = this.checkHome(url);
      });
  }

  private checkHome(url: string): boolean {
    return url === '/' || url === '';
  }
}
