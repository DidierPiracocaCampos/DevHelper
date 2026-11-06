import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { SiteHeader } from '../../components/site-header/site-header';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { LegalAcceptanceI } from '../../models/legal-acceptance.interface';
import { LegalAcceptanceService } from '../../services/legal-acceptance.service';
import { SeoService } from '../../services/seo.service';
import { TermsService } from '../../services/terms.service';

type LegalState<T> = { status: 'loading' } | { status: 'loaded'; data: T };

@Component({
  selector: 'landing-legal-terms',
  standalone: true,
  imports: [SiteHeader, SiteFooter, MarkdownPipe],
  templateUrl: './legal-terms.html',
  styleUrl: './legal-terms.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalTerms implements OnInit {
  private readonly _terms = inject(TermsService);
  private readonly _legal = inject(LegalAcceptanceService);
  private readonly _auth = inject(Authenticator);
  private readonly _seo = inject(SeoService);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly _user = this._auth.user;
  private readonly _userUid = computed(() => this._user()?.uid ?? null);
  protected readonly content = this._terms.content;
  protected readonly isLogged = this._auth.isLoggedIn;
  protected readonly loadFailed = signal(false);

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

  constructor() {
    this._seo.set({
      title: 'Términos y Condiciones — DevHelper',
      description: 'Términos y Condiciones de DevHelper, la app para registrar tus avances.',
      path: '/legal/terms',
    });
  }

  async ngOnInit(): Promise<void> {
    // The document is fetched in the browser; a failed prerender fetch is not a real failure.
    await this._terms.load();
    this.loadFailed.set(isPlatformBrowser(this._platformId) && this.content() === null);
  }

  async accept(): Promise<void> {
    const u = this._user();
    if (!u) return;
    await this._legal.accept(u.uid, 'manual');
  }
}
