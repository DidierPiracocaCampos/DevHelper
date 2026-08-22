import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

interface SecurityItem {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
}

const SECURITY_ITEMS: readonly SecurityItem[] = [
  {
    icon: 'lock',
    title: 'Cifrado AES-GCM 256',
    description: 'En dispositivo antes de sincronizar.',
    badge: 'AES-256',
  },
  {
    icon: 'key',
    title: 'PIN o Passkey',
    description: 'Con clave local para desbloquear el vault.',
  },
  {
    icon: 'person_off',
    title: 'Zero-knowledge',
    description: 'Sin acceso administrativo ni cuenta maestra.',
  },
  {
    icon: 'cloud_done',
    title: 'Firebase eur3',
    description: 'Acceso owner-only en región europea.',
  },
];

@Component({
  selector: 'landing-section-security',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './section-security.html',
  styleUrl: './section-security.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionSecurity {
  readonly id = input<string>('security');
  readonly items = SECURITY_ITEMS;
}
