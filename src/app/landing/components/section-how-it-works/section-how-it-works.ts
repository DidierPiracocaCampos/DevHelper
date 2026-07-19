import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  readonly number: number;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly link: string;
  readonly linkLabel: string;
}

const STEPS: readonly Step[] = [
  {
    number: 1,
    icon: 'person_add',
    title: 'Crea cuenta',
    description: 'Email y password en Firebase Auth. Sin verificación obligatoria para empezar.',
    link: '/login/register',
    linkLabel: 'Crear cuenta',
  },
  {
    number: 2,
    icon: 'lock',
    title: 'Configura tu vault',
    description:
      'Elige PIN o Passkey (WebAuthn). La clave maestra se genera en tu navegador y nunca sale.',
    link: '/legal/terms',
    linkLabel: 'Cómo funciona el cifrado',
  },
  {
    number: 3,
    icon: 'add_circle',
    title: 'Empieza a guardar',
    description:
      'Proyectos, tareas, contraseñas, ficheros. Todo cifrado en cliente con AES-GCM 256 antes de salir del dispositivo.',
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
