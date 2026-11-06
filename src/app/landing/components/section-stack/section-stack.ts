import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SOCIAL_LINKS } from '../../data/social-links';

interface StackItem {
  readonly name: string;
  readonly logo: string;
  readonly role: string;
}

const STACK: readonly StackItem[] = [
  { name: 'Angular 20', logo: '/icons/stack/angular.svg', role: 'Interfaz' },
  { name: 'DaisyUI 5', logo: '/icons/stack/daisyui.svg', role: 'Componentes' },
  { name: 'Tailwind 4', logo: '/icons/stack/tailwind.svg', role: 'Estilos' },
  { name: 'Firebase', logo: '/icons/stack/firebase.svg', role: 'Datos y autenticación' },
];

@Component({
  selector: 'landing-section-stack',
  standalone: true,
  templateUrl: './section-stack.html',
  styleUrl: './section-stack.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionStack {
  readonly id = input<string>('stack');
  readonly entries = STACK;
  protected readonly github = SOCIAL_LINKS.github;
}
