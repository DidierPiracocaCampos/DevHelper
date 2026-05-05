import { computed, effect, inject, Injectable, signal, Signal } from '@angular/core';
import { VaultRepository } from './services/vault.repository';
import { MasterKey } from './services/master-key';
import { UnlockKeyWithPin } from './services/unlock-key-with-pin';
import { UnlockKeyI } from './models/unlock-key.model';
import { firstValueFrom } from 'rxjs';
import { VAULT_ERRORS, VAULT_STATUS } from './models/vault.model';


@Injectable({
  providedIn: 'root',
})
export class VaultSecurity {

  private _repository = inject(VaultRepository);
  private _masterKey = inject(MasterKey);
  private _unlockWithPin = inject(UnlockKeyWithPin);
  private _vaultKey?: Uint8Array;
  private _secureModal: Signal<HTMLDialogElement | undefined> = signal(undefined);

  secureModal(secureModal: Signal<HTMLDialogElement | undefined>) {
    this._secureModal = secureModal;
  }

  readonly status = this._repository.status;

  readonly haveUnlockKeyWithPin = computed(() => {
    const unlock = this._repository.unlockKeyWithPin();
    return unlock != undefined
  });

  private statusChanges = effect(() => {
    const s = this._repository.status();
    if (s === VAULT_STATUS.NO_CREATE) {
      this._secureModal()?.showModal();
      return;
    }
  });

  async createVault(type: 'pin' | 'passkey', pin?: string) {
    let unlockKey: UnlockKeyI | undefined = undefined;
    try {
      const masterKey = await this._masterKey.generateMasterKey();
      const masterKeyBuffer = await this._masterKey.exportMasterKey(masterKey);
      if (type === 'pin' && pin) {
        unlockKey = await this._unlockWithPin.createUnlockKey(pin, masterKeyBuffer);
      }
      if (!unlockKey) {
        throw new Error(VAULT_ERRORS.CREATE_UNLOCK_WITH_PIN)
      }
      const saveUnlockKey = await firstValueFrom(this._repository.create(unlockKey));
      this._repository.unlockList.reload();
      return true;
    } catch (error) {
      return false;
    }
  }

  lockVault() {
    this._vaultKey = undefined;
  }

  showModal() {
    this._secureModal()?.showModal();
  }

  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      const currentUnlockKey = this._repository.unlockKeyWithPin();

      if (!currentUnlockKey) {
        throw new Error(VAULT_ERRORS.NOT_EXIST_UNLOCK_WITH_PIN);
      }

      const updatedUnlockKey = await this._unlockWithPin.changePin(
        oldPin,
        newPin,
        currentUnlockKey
      );

      await firstValueFrom(
        this._repository.set(currentUnlockKey.id, updatedUnlockKey)
      );

      this._repository.unlockList.reload();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

}