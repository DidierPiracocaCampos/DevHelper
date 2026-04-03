import { Component, inject } from '@angular/core';
import { CardBase } from "../../../shared/components/card-base/card-base";
import { ActionButton } from "../../../shared/components/action-button/action-button";
import { NasaPicture } from "../nasa-picture/nasa-picture";
import { Authenticator } from '../../../auth/services/authenticator';

@Component({
  selector: 'app-home',
  imports: [CardBase, ActionButton, NasaPicture],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  private _authenticator = inject(Authenticator);
  logout(){
    this._authenticator.logout();
  }
}
