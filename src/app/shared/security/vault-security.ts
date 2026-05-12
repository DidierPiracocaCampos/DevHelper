import { computed, effect, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { VaultRepository } from './services/vault.repository';
import { MasterKey } from './services/master-key';
import { UnlockKeyWithPin } from './services/unlock-key-with-pin';
import { UnlockKeyWithPasskey } from './services/unlock-key-with-passkey';
import { UnlockKeyI } from './models/unlock-key.model';
import { firstValueFrom } from 'rxjs';
import { VAULT_ERRORS, VAULT_STATUS } from './models/vault.model';
import { UiModal } from '../components/ui-modal/ui-modal';


@Injectable({
  providedIn: 'root',
})
export class VaultSecurity {

  private _auth = inject(Auth);
  private _repository = inject(VaultRepository);
  private _masterKey = inject(MasterKey);
  private _unlockWithPin = inject(UnlockKeyWithPin);
  private _unlockWithPasskey = inject(UnlockKeyWithPasskey);
  private _vaultKey?: Uint8Array;
  private readonly MAX_PIN_ATTEMPTS = 3;
  private readonly PIN_LOCKOUT_DURATION_MS = 5 * 60 * 1000;

  private _secureModal: WritableSignal<HTMLDialogElement | undefined> = signal(undefined);
  private _unlockModal: WritableSignal<HTMLDialogElement | undefined> = signal(undefined);
  private _secureModalUi: WritableSignal<UiModal | undefined> = signal(undefined);
  private _pinAttempts = 0;
  private _pinLockUntil: number | null = null;

  secureModal(secureModal: Signal<HTMLDialogElement | undefined>) {
    this._secureModal.set(secureModal() as HTMLDialogElement);
  }

  unlockModal(unlockModal: Signal<HTMLDialogElement | undefined>) {
    this._unlockModal.set(unlockModal() as HTMLDialogElement);
  }

  setSecureModalUi(modal: UiModal) {
    this._secureModalUi.set(modal);
  }

  readonly status = this._repository.status;

  readonly haveUnlockKeyWithPin = computed(() => {
    const unlock = this._repository.unlockKeyWithPin();
    return unlock != undefined
  });

  readonly haveUnlockKeyWithPasskey = computed(() => {
    const unlock = this._repository.unlockKeyWithPasskey();
    return unlock != undefined
  });

  readonly isWebAuthnSupported = signal(false);

  constructor() {
    this._checkWebAuthnSupport();
  }

  private async _checkWebAuthnSupport() {
    if (!window.PublicKeyCredential) return;
    try {
      const supported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      this.isWebAuthnSupported.set(supported);
    } catch {
      // mantiene false
    }
  }

  readonly isUnlocked = computed(() => {
    return this._vaultKey !== undefined;
  });

  private statusChanges = effect(() => {
    const s = this._repository.status();
    if (s === VAULT_STATUS.NO_CREATE) {
      const uiModal = this._secureModalUi();
      if (uiModal) {
        uiModal.open();
      } else {
        this._secureModal()?.showModal();
      }
      return;
    }
  });

  private _isPinLocked(): boolean {
    if (this._pinLockUntil === null) return false;
    if (Date.now() > this._pinLockUntil) {
      this._pinLockUntil = null;
      this._pinAttempts = 0;
      return false;
    }
    return true;
  }

  private _recordPinAttempt(success: boolean) {
    if (success) {
      this._pinAttempts = 0;
      this._pinLockUntil = null;
      return;
    }
    this._pinAttempts++;
    if (this._pinAttempts >= this.MAX_PIN_ATTEMPTS) {
      this._pinLockUntil = Date.now() + this.PIN_LOCKOUT_DURATION_MS;
    }
  }

  async createVault(type: 'pin' | 'passkey', pin?: string) {
    let unlockKey: UnlockKeyI | undefined = undefined;
    try {
      const user = this._auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const masterKey = await this._masterKey.generateMasterKey();
      const masterKeyBuffer = await this._masterKey.exportMasterKey(masterKey);
      if (type === 'pin' && pin) {
        unlockKey = await this._unlockWithPin.createUnlockKey(pin, masterKeyBuffer);
      } else if (type === 'passkey') {
        const attestation = await this._unlockWithPasskey.registerPasskeyAttestation(
          user.uid,
          user.email || undefined,
          user.displayName || undefined
        );
        unlockKey = await this._unlockWithPasskey.createUnlockKeyWithPasskey(attestation, masterKeyBuffer);
      }
      if (!unlockKey) {
        throw new Error(VAULT_ERRORS.CREATE_UNLOCK_WITH_PIN)
      }
      const saveUnlockKey = await firstValueFrom(this._repository.addDoc(unlockKey));
      this._repository.unlockList.reload();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async createVaultWithPasskey() {
    return this.createVault('passkey');
  }

  lockVault() {
    this._vaultKey = undefined;
  }

  showModal() {
    const uiModal = this._secureModalUi();
    if (uiModal) {
      uiModal.open();
      return;
    }
    this._secureModal()?.showModal();
  }

  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      if (this._isPinLocked()) {
        throw new Error(VAULT_ERRORS.TOO_MANY_ATTEMPTS);
      }

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
        this._repository.setDoc(currentUnlockKey.id, updatedUnlockKey)
      );

      this._repository.unlockList.reload();
      this._recordPinAttempt(true);
      return true;
    } catch (error) {
      this._recordPinAttempt(false);
      console.error(error);
      return false;
    }
  }

}