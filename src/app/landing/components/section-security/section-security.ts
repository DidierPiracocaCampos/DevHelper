import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

interface SecurityItem {
  readonly text: string;
}

const SECURITY_ITEMS: readonly SecurityItem[] = [
  {
    text: 'Cifrado AES-GCM 256 en dispositivo antes de sincronizar.',
  },
  {
    text: 'PIN o Passkey con clave local.',
  },
  {
    text: 'Sin acceso administrativo ni cuenta maestra.',
  },
  {
    text: 'Firebase eur3 y acceso owner-only.',
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
