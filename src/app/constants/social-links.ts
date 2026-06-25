export interface SocialLink {
  href: string;
  image: string;
  label: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    href: 'https://www.facebook.com/republicafolklore',
    image: 'assets/BOTONES/Botones%20RRSS-01.png',
    label: 'Facebook',
  },
  {
    href: 'https://www.instagram.com/republicafolklore/',
    image: 'assets/BOTONES/Botones%20RRSS-02.png',
    label: 'Instagram',
  },
  {
    href: 'https://www.youtube.com/@republicafolklore',
    image: 'assets/BOTONES/Botones%20RRSS-03.png',
    label: 'YouTube',
  },
];
