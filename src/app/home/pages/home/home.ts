import { Component, inject } from '@angular/core';
import { UiCard } from "../../../shared/components/card-base/card-base";
import { UiCardButton } from "../../../shared/components/card-button/card-button";
import { NasaPicture } from "../../components/nasa-picture/nasa-picture";
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from "../../components/password-list/password-list";
import { Loader } from '../../../shared/service/loader';
import { ModalCreateVault, ModalUnlockVault, VaultSecurity } from "../../../shared/security";

@Component({
  selector: 'app-home',
  imports: [UiCard, UiCardButton, NasaPicture, PasswordList, ModalCreateVault, ModalUnlockVault],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {

  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _vault = inject(VaultSecurity);

  async ngOnInit() {
    this._loader.hide();
  }

  logout() {
    this._authenticator.logout();
  }

  openVault(){
    this._vault.openUnlockVaultModal();
  }
}