import type { Timestamp } from '@angular/fire/firestore';

export interface LegalAcceptanceI {
  version: string;
  lang: 'es';
  acceptedAt: Timestamp;
  source: 'register' | 're-accept-modal' | 'manual';
}
