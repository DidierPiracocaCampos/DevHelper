import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authenticator } from '../../../shared/service/authenticator';

@Component({
  selector: 'landing-site-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  readonly isLogged = input<boolean>(false);
  private readonly _auth = inject(Authenticator);
  private readonly _document = inject(DOCUMENT);

  /** The daisyUI dropdown stays open while focus is inside it, so release focus to close it. */
  protected closeMenu(): void {
    (this._document.activeElement as HTMLElement | null)?.blur();
  }

  async logout(): Promise<void> {
    await this._auth.logout();
  }
}
