import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SecurityItem {
  readonly text: string;
}

const SECURITY_ITEMS: readonly SecurityItem[] = [
  {
    text: 'Cifrado AES-GCM 256-bit en cliente. La clave maestra se genera en tu navegador y nunca abandona el dispositivo. Sin HTTPS downgrade: el payload que llega a Firebase ya está cifrado.',
  },
  {
    text: 'Autenticación con PIN o Passkey (WebAuthn). El PIN se hashea con PBKDF2 y se valida localmente. La Passkey nunca sale del autenticador. Si pierdes ambos métodos y no tienes código de recuperación, los datos son irrecuperables por diseño.',
  },
  {
    text: 'Sin backdoor del servidor. Ni siquiera DevHelper puede leer tus datos. No hay cuenta maestra, no hay API de recuperación, no hay "modo soporte".',
  },
  {
    text: 'Datos en Firebase (Firestore) en la región eur3 (europe-west). Storage cifrado en reposo. Acceso solo del owner del vault via reglas de Firestore.',
  },
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
