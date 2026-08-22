import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  readonly number: number;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly link: string;
  readonly linkLabel: string;
  readonly fragment?: string;
}

const STEPS: readonly Step[] = [
  {
    number: 1,
    icon: 'person_add',
    title: 'Crea tu cuenta',
    description: 'Regístrate con email y password en Firebase Auth y empieza sin onboarding largo.',
    link: '/login/register',
    linkLabel: 'Crear cuenta',
  },
  {
    number: 2,
    icon: 'lock',
    title: 'Cierra tu vault',
    description:
      'Elige PIN o Passkey. La clave maestra se genera localmente y no sale de tu dispositivo.',
    link: '/',
    linkLabel: 'Cómo funciona el cifrado',
    fragment: 'security',
  },
  {
    number: 3,
    icon: 'add_circle',
    title: 'Guarda y recupera',
    description:
      'Conserva proyectos, tareas, credenciales, archivos y eventos cifrados con AES-GCM 256.',
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
