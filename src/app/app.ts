import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToastComponent } from './shared/components/toast/ui-toast';
import { ConfirmModal } from './shared/components/confirm-modal/confirm-modal';
import { LoaderComponent } from './shared/components/loader/loader';
import { SearchPalette } from './shared/search/components/search-palette/search-palette';
import { Authenticator } from './shared/service/authenticator';
import { TermsModal } from './landing/components/terms-modal/terms-modal';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    UiToastComponent,
    ConfirmModal,
    LoaderComponent,
    SearchPalette,
    TermsModal,
  ],
  templateUrl: './app.html',
})
export class App {
  private readonly _auth = inject(Authenticator);
  protected readonly isLoggedIn = this._auth.isLoggedIn;
  protected readonly title = 'devhelper-web';
}
