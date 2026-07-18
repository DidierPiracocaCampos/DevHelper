import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: 'lock',
    title: 'Vault cifrado',
    description: 'AES-GCM en cliente. PIN o Passkey (WebAuthn).',
  },
  {
    icon: 'folder_open',
    title: 'Proyectos',
    description: 'Unidades principales con tareas, ficheros y contraseñas.',
  },
  {
    icon: 'task_alt',
    title: 'Tareas y notas',
    description: 'Tareas con fecha de vencimiento o notas libres.',
  },
  { icon: 'key', title: 'Contraseñas', description: 'Cifradas. Asociadas a una tarea o globales.' },
  { icon: 'event', title: 'Eventos', description: 'Recordatorios globales desde una sola vista.' },
  {
    icon: 'memory',
    title: 'IA local opcional',
    description: '100% en tu dispositivo. Ningún dato sale del navegador.',
  },
];

@Component({
  selector: 'landing-section-features',
  standalone: true,
  templateUrl: './section-features.html',
  styleUrl: './section-features.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionFeatures {
  readonly id = input<string>('features');
  readonly features = FEATURES;
}
