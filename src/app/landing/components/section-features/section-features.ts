import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type FeatureSize = 'large' | 'compact';

interface FeatureImage {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly ratio: string;
}

interface Feature {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly size: FeatureSize;
  readonly highlights: readonly string[];
  readonly image: FeatureImage | null;
}

const FEATURES: readonly Feature[] = [
  {
    id: 'vault',
    icon: 'lock',
    title: 'Un vault que solo tú puedes abrir',
    description:
      'AES-GCM 256 con PIN o Passkey (WebAuthn). Tu clave maestra nunca sale del navegador.',
    size: 'large',
    highlights: ['Cifrado en dispositivo', 'PIN o Passkey', 'Sin clave en servidor'],
    image: {
      src: '/img/landing/vault.png',
      alt: 'Vault cifrado en cliente',
      width: 1280,
      height: 490,
      ratio: '1280 / 490',
    },
  },
  {
    id: 'projects-tasks',
    icon: 'folder_open',
    title: 'Proyectos con todo su contexto',
    description:
      'Organiza por proyecto: tareas con vencimiento o notas libres, con espacio para adjuntos y secretos.',
    size: 'large',
    highlights: ['Proyecto → tareas', 'Tareas o notas', 'Contexto técnico junto'],
    image: {
      src: '/img/landing/projects-tasks.png',
      alt: 'Proyectos con tareas y ficheros',
      width: 1200,
      height: 490,
      ratio: '1200 / 490',
    },
  },
  {
    id: 'files',
    icon: 'attach_file',
    title: 'Archivos listos cuando vuelvan a hacer falta',
    description:
      'Adjuntos globales o por tarea. Se parten en chunks y viven bajo el mismo vault. Hasta 5 MB por fichero.',
    size: 'compact',
    highlights: [],
    image: {
      src: '/img/landing/files.png',
      alt: 'Archivos cifrados',
      width: 800,
      height: 500,
      ratio: '800 / 500',
    },
  },
  {
    id: 'passwords',
    icon: 'key',
    title: 'Credenciales junto al trabajo que las necesita',
    description: 'Secretos cifrados en cliente: globales o ligados a una tarea concreta.',
    size: 'compact',
    highlights: [],
    image: {
      src: '/img/landing/passwords.png',
      alt: 'Contraseñas del vault',
      width: 800,
      height: 500,
      ratio: '800 / 500',
    },
  },
  {
    id: 'events',
    icon: 'event',
    title: 'Eventos y recordatorios sin salir del workspace',
    description: 'Compromisos globales en una sola vista, junto al resto del workspace.',
    size: 'compact',
    highlights: [],
    image: {
      src: '/img/landing/events.png',
      alt: 'Eventos y recordatorios',
      width: 800,
      height: 500,
      ratio: '800 / 500',
    },
  },
  {
    id: 'ai',
    icon: 'memory',
    title: 'Una IA local para consultar tu memoria técnica',
    description:
      'Opt-in explícito. 100% en tu dispositivo. Consultas estructuradas sobre tu workspace.',
    size: 'compact',
    highlights: [],
    image: {
      src: '/img/landing/ai.png',
      alt: 'IA local opcional',
      width: 800,
      height: 500,
      ratio: '800 / 500',
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
