import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { LegalAcceptanceI } from '../../models/legal-acceptance.interface';
import { LegalAcceptanceService } from '../../services/legal-acceptance.service';
import { TermsService } from '../../services/terms.service';

type LegalState<T> = { status: 'loading' } | { status: 'loaded'; data: T };

@Component({
  selector: 'landing-legal-terms',
  standalone: true,
  imports: [RouterLink, MarkdownPipe],
  templateUrl: './legal-terms.html',
  styleUrl: './legal-terms.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalTerms implements OnInit {
  private readonly _terms = inject(TermsService);
  private readonly _legal = inject(LegalAcceptanceService);
  private readonly _auth = inject(Authenticator);

  private readonly _user = this._auth.user;
  private readonly _userUid = computed(() => this._user()?.uid ?? null);
  protected readonly content = this._terms.content;

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

  protected readonly showAccept = computed(() => {
    if (this._legalState().status !== 'loaded') return false;
    const u = this._user();
    if (!u) return false;
    return this._legal.needsReAcceptance(this.currentAcceptance());
  });

  async ngOnInit(): Promise<void> {
    await this._terms.load();
  }

  async accept(): Promise<void> {
    const u = this._user();
    if (!u) return;
    await this._legal.accept(u.uid, 'manual');
  }
}
