import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  readonly number: number;
  readonly title: string;
  readonly description: string;
  readonly link: string;
  readonly linkLabel: string;
  readonly fragment?: string;
}

const STEPS: readonly Step[] = [
  {
    number: 1,
    title: 'Crea tu cuenta',
    description: 'Regístrate con email y contraseña o con Google. Sin onboarding largo.',
    link: '/login/register',
    linkLabel: 'Crear cuenta',
  },
  {
    number: 2,
    title: 'Cierra tu vault',
    description:
      'Elige PIN o Passkey. La clave maestra se genera en tu navegador y solo se guarda protegida por ese método.',
    link: '/',
    linkLabel: 'Qué se cifra y qué no',
    fragment: 'security',
  },
  {
    number: 3,
    title: 'Guarda y recupera',
    description:
      'Anota el problema y la solución mientras trabajas. Cuando vuelva a aparecer, búscalo.',
    link: '/login',
    linkLabel: 'Iniciar sesión',
  },
];

@Component({
  selector: 'landing-section-how-it-works',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-how-it-works.html',
  styleUrl: './section-how-it-works.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHowItWorks {
  readonly id = input<string>('how-it-works');
  readonly steps = STEPS;
}
