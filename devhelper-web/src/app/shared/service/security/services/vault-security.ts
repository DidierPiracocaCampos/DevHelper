import { ElementRef, inject, Injectable, signal, Signal } from '@angular/core';
import { VaultRepository } from './vault.repository';
import { MasterKey } from './master-key';
import { UnlockKeyWithPin } from './unlock-key-with-pin';
/*TODO: 
implementar con sistema de guardado 
*/
@Injectable({
  providedIn: 'root',
})
export class VaultSecurity {
  private _repository = inject(VaultRepository);
  private _masterKey = inject(MasterKey);
  private _unlockWithPin = inject(UnlockKeyWithPin);
  private _vaultKey?: Uint8Array;
  private _secureModal: Signal<HTMLDialogElement | undefined> = signal(undefined);

  set secureModal(secureModal: Signal<HTMLDialogElement | undefined>) {
    this._secureModal = secureModal;
  }

  async createVault(type: 'pin' | 'passkey', pin?: string) {
    const masterKey = await this._masterKey.generateMasterKey();

  }

  lockVault() {
    this._vaultKey = undefined;
  }

  private createUnlockKeyWithPin() {

  }

}