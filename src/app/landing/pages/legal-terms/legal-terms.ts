import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { LegalAcceptanceI } from '../../models/legal-acceptance.interface';
import { LegalAcceptanceService } from '../../services/legal-acceptance.service';
import { TermsService } from '../../services/terms.service';

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
  protected readonly content = this._terms.content;

  protected readonly currentAcceptance = toSignal(
    toObservable(this._user).pipe(switchMap((u) => (u ? this._legal.current(u.uid) : of(null)))),
    { initialValue: null as LegalAcceptanceI | null },
  );

  protected readonly showAccept = computed(() => {
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
