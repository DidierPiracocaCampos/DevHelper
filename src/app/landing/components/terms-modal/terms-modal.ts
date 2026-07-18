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
import { of, switchMap } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { LegalAcceptanceI } from '../../models/legal-acceptance.interface';
import { LegalAcceptanceService } from '../../services/legal-acceptance.service';

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
  protected readonly dismissedThisSession = signal(false);
  private readonly _user = this._auth.user;

  protected readonly currentAcceptance = toSignal(
    toObservable(this._user).pipe(switchMap((u) => (u ? this._legal.current(u.uid) : of(null)))),
    { initialValue: null as LegalAcceptanceI | null },
  );

  protected readonly showModal = computed(() => {
    const u = this._user();
    if (!u) return false;
    if (this.dismissedThisSession()) return false;
    return this._legal.needsReAcceptance(this.currentAcceptance());
  });

  private readonly _resetDismissOnUserChange = effect(() => {
    const _u = this._user();
    void this.dismissedThisSession.set(false);
  });

  private readonly _syncIsOpen = effect(() => {
    this.isOpen.set(this.showModal());
  });

  protected onClosed(): void {
    this.dismissedThisSession.set(true);
  }

  protected dismiss(): void {
    this.dismissedThisSession.set(true);
  }

  protected async accept(): Promise<void> {
    const u = this._user();
    if (!u) return;
    await this._legal.accept(u.uid, 're-accept-modal');
  }
}
