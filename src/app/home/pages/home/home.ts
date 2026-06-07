import { Component, inject, signal } from '@angular/core';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { NasaPicture } from '../../components/nasa-picture/nasa-picture';
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from '../../components/password-list/password-list';
import { Loader } from '../../../shared/service/loader';
import { ModalCreateVault, ModalUnlockVault, VaultSecurity } from '../../../shared/security';
import { NasaImageSection, UiConfigModal } from '../../../shared/preferences';

@Component({
  selector: 'app-home',
  imports: [
    UiCard,
    UiCardButton,
    NasaPicture,
    PasswordList,
    ModalCreateVault,
    ModalUnlockVault,
    UiConfigModal,
    NasaImageSection,
  ],
  templateUrl: './home.html',
})
export default class Home {
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _vault = inject(VaultSecurity);

  protected readonly isConfigOpen = signal(false);

  async ngOnInit() {
    this._loader.hide();
  }

  logout() {
    this._authenticator.logout();
  }

  openVault() {
    this._vault.openUnlockVaultModal();
  }

  openConfig() {
    this.isConfigOpen.set(true);
  }
}
