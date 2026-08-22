import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const STACK: readonly string[] = [
  'Angular 20',
  'Firebase Auth',
  'Firestore eur3',
  'DaisyUI 5',
  'Tailwind 4',
  'WebAuthn',
  'Web Crypto API',
  'TypeScript strict',
  'Vitest',
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
  readonly items = STACK;
}
