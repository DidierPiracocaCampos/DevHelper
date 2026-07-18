import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SecurityItem {
  readonly text: string;
}

const SECURITY_ITEMS: readonly SecurityItem[] = [
  { text: 'Cifrado AES-GCM 256-bit en cliente. La clave maestra nunca sale de tu dispositivo.' },
  {
    text: 'Autenticación con PIN o Passkey (WebAuthn). Si pierdes ambos métodos y no tienes código de recuperación, los datos son irrecuperables.',
  },
  { text: 'Sin backdoor del servidor: ni siquiera DevHelper puede leer tus datos.' },
  { text: 'Datos en Firebase (Firestore) en la región eur3.' },
];

@Component({
  selector: 'landing-section-security',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-security.html',
  styleUrl: './section-security.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionSecurity {
  readonly id = input<string>('security');
  readonly items = SECURITY_ITEMS;
}
