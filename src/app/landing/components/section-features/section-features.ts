import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface FeatureImage {
  readonly src: string;
  readonly alt: string;
}

interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly image: FeatureImage | null;
}

const FEATURES: readonly Feature[] = [
  {
    icon: 'lock',
    title: 'Vault cifrado',
    description:
      'AES-GCM 256 en cliente. PIN o Passkey (WebAuthn). Tu clave maestra nunca sale del navegador.',
    image: {
      src: '/img/landing/vault-modal.png',
      alt: 'Modal de configuración del vault con opciones PIN y Passkey',
    },
  },
  {
    icon: 'folder_open',
    title: 'Proyectos',
    description: 'Unidades principales con tareas, ficheros y contraseñas. (vista previa)',
    image: {
      src: '/img/landing/mockup-projects.svg',
      alt: '(vista previa) proyectos con tareas y ficheros',
    },
  },
  {
    icon: 'task_alt',
    title: 'Tareas y notas',
    description: 'Tareas con fecha de vencimiento o notas libres por proyecto. (vista previa)',
    image: {
      src: '/img/landing/mockup-tasks.svg',
      alt: '(vista previa) tareas con fecha de vencimiento y notas',
    },
  },
  {
    icon: 'key',
    title: 'Contraseñas',
    description: 'Cifradas en cliente. Asociadas a una tarea o globales al vault.',
    image: { src: '/img/landing/password-list.png', alt: 'Lista de contraseñas cifradas' },
  },
  {
    icon: 'event',
    title: 'Eventos',
    description: 'Recordatorios globales desde una sola vista. (vista previa)',
    image: {
      src: '/img/landing/mockup-events.svg',
      alt: '(vista previa) eventos recordatorios en una vista de calendario',
    },
  },
  {
    icon: 'memory',
    title: 'IA local opcional',
    description:
      '100% en tu dispositivo. Opt-in explícito. Ningún dato sale del navegador. (vista previa)',
    image: {
      src: '/img/landing/mockup-ai.svg',
      alt: '(vista previa) IA local 100 por ciento en tu dispositivo',
    },
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
