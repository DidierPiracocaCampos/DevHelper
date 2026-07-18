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

  async logout(): Promise<void> {
    await this._auth.logout();
  }
}
