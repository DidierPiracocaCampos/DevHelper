import { Component, inject } from '@angular/core';
import { CardBase } from "../../../shared/components/card-base/card-base";
import { CardButton } from "../../../shared/components/card-button/card-button";
import { NasaPicture } from "../../components/nasa-picture/nasa-picture";
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from "../../components/password-list/password-list";
import { Loader } from '../../../shared/service/loader';
import { ModalCreateVault } from "../../../shared/security";

@Component({
  selector: 'app-home',
  imports: [CardBase, CardButton, NasaPicture, PasswordList, ModalCreateVault],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {

  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);

  async ngOnInit() {
    this._loader.hide();
  }

  logout() {
    this._authenticator.logout();
  }

}