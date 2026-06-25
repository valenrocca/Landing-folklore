import { Component } from '@angular/core';
import { SOCIAL_LINKS } from '../../constants/social-links';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly socialLinks = SOCIAL_LINKS;
}
