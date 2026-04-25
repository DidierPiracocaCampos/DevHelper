import { Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { CardBase } from "../../../shared/components/card-base/card-base";
import { CardButton } from "../../../shared/components/card-button/card-button";
import { NasaPicture } from "../nasa-picture/nasa-picture";
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from "../password-list/password-list";
import { Button } from "../../../shared/components/button/button";
import { InputGeneric } from "../../../shared/forms/components/input-generic/input-generic";
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PassKeyService } from '../../../shared/service/pass-key';
import { VaultSecurity } from '../../../shared/service/security';

@Component({
  selector: 'app-home',
  imports: [CardBase, CardButton, NasaPicture, PasswordList, Button, ReactiveFormsModule, InputGeneric],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  protected secureModal = viewChild<ElementRef<HTMLDialogElement>>('secureModal');
  private _vault = inject(VaultSecurity);
  private _authenticator = inject(Authenticator);
  private _srvPasskey = inject(PassKeyService);
  private _fb = inject(FormBuilder).nonNullable;
  private _modal = computed(() => this.secureModal()?.nativeElement);

  async ngOnInit() {
    this._vault.secureModal = this._modal;
    this._modal()?.showModal();
  }

  async createSecurity() {
  }

  async registerPasskey() {
    await this._srvPasskey.registerPasskey();
  }

  protected _secureForm = this._fb.group({
    type: this._fb.control<'pin' | 'passkey'>('pin'),
    pin: this._fb.control<string>(''),
  });

  logout() {
    this._authenticator.logout();
  }
}
