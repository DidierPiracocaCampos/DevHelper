import { inject, Injectable } from '@angular/core';
import { Firestore, doc, docData, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { TERMS_LANG, TERMS_VERSION } from '../data/terms-version';
import { LegalAcceptanceI } from '../models/legal-acceptance.interface';

@Injectable({ providedIn: 'root' })
export class LegalAcceptanceService {
  private _firestore = inject(Firestore);

  static docPath(uid: string): string[] {
    return ['users', uid, 'legal', 'termsAccepted'];
  }

  current(uid: string): Observable<LegalAcceptanceI | null> {
    const [a, b, c, d, e] = LegalAcceptanceService.docPath(uid);
    const ref = doc(this._firestore, a, b, c, d, e);
    return docData(ref).pipe(map((data) => (data ? (data as LegalAcceptanceI) : null)));
  }

  async accept(uid: string, source: 'register' | 're-accept-modal' | 'manual'): Promise<void> {
    const [a, b, c, d, e] = LegalAcceptanceService.docPath(uid);
    const ref = doc(this._firestore, a, b, c, d, e);
    await setDoc(ref, {
      version: TERMS_VERSION,
      lang: TERMS_LANG,
      acceptedAt: serverTimestamp(),
      source,
    });
  }

  needsReAcceptance(current: LegalAcceptanceI | null): boolean {
    if (!current) return true;
    return current.version !== TERMS_VERSION;
  }
}
