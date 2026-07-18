import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Authenticator } from '../../../shared/service/authenticator';
import { SiteHeader } from '../../components/site-header/site-header';
import { SiteFooter } from '../../components/site-footer/site-footer';

@Component({
  selector: 'landing-about',
  standalone: true,
  imports: [SiteHeader, SiteFooter],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly _auth = inject(Authenticator);
  protected readonly isLogged = this._auth.isLoggedIn;
}
