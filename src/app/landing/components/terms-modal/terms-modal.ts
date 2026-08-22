import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { LegalAcceptanceI } from '../../models/legal-acceptance.interface';
import { LegalAcceptanceService } from '../../services/legal-acceptance.service';

type LegalState<T> = { status: 'loading' } | { status: 'loaded'; data: T };

@Component({
  selector: 'landing-terms-modal',
  standalone: true,
  imports: [UiModal, RouterLink],
  templateUrl: './terms-modal.html',
  styleUrl: './terms-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsModal {
  private readonly _auth = inject(Authenticator);
  private readonly _legal = inject(LegalAcceptanceService);

  protected readonly isOpen = signal(false);
  private readonly _user = this._auth.user;
  private readonly _userUid = computed(() => this._user()?.uid ?? null);

  private readonly _legalState$ = toObservable(this._userUid).pipe(
    switchMap((uid): Observable<LegalState<LegalAcceptanceI | null>> => {
      if (!uid) return of({ status: 'loaded', data: null });
      return this._legal.current(uid).pipe(
        map((data) => ({ status: 'loaded' as const, data })),
        startWith({ status: 'loading' as const }),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected readonly _legalState = toSignal(this._legalState$, {
    initialValue: { status: 'loading' } as LegalState<LegalAcceptanceI | null>,
  });

  protected readonly currentAcceptance = computed<LegalAcceptanceI | null>(() => {
    const state = this._legalState();
    return state.status === 'loaded' ? state.data : null;
  });

  protected readonly legalLoaded = computed(() => this._legalState().status === 'loaded');

  protected readonly showModal = computed(() => {
    if (!this.legalLoaded()) return false;
    if (!this._user()) return false;
    return this._legal.needsReAcceptance(this.currentAcceptance());
  });

  private readonly _syncIsOpen = effect(() => {
    this.isOpen.set(this.showModal());
  });

  protected async accept(): Promise<void> {
    const u = this._user();
    if (!u) return;
    await this._legal.accept(u.uid, 're-accept-modal');
  }
}
