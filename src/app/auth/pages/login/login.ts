import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Authenticator } from '../../../shared/service/authenticator';
import { Loader } from '../../../shared/service/loader';
import { UiAuthShell } from '../../../auth/components/ui-auth-shell';

@Component({
  selector: 'app-login',
  imports: [RouterOutlet, UiAuthShell],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full overflow-x-hidden' },
})
export default class Login {
  private _loader = inject(Loader);
  private _authenticator = inject(Authenticator);

  ngOnInit(): void {
    this._loader.hide();
  }

  async loginWithGoogle() {
    this._loader.show();
    const result = await this._authenticator.loginWithGoogle();
    if (!result.success) {
      this._loader.hide();
    }
  }

  async loginWithGithub() {
    this._loader.show();
    const result = await this._authenticator.loginWithGithub();
    if (!result.success) {
      this._loader.hide();
    }
  }
}
