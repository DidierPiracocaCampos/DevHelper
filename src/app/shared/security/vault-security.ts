import { computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { VaultRepository } from './services/vault.repository';
import { MasterKey } from './services/master-key';
import { PinLockoutService } from './services/pin-lockout.service';
import { UnlockKeyWithPin } from './services/unlock-key-with-pin';
import { UnlockKeyWithPasskey } from './services/unlock-key-with-passkey';
import { VaultModalState } from './services/vault-modal-state';
import { firstValueFrom } from 'rxjs';
import { VAULT_ERRORS, VAULT_STATUS } from './models/vault.model';

export interface CreateVaultOptions {
  pin?: string;
  withPasskey?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VaultSecurity {
  private _auth = inject(Auth);
  private _repository = inject(VaultRepository);
  private _masterKey = inject(MasterKey);
  private _unlockWithPin = inject(UnlockKeyWithPin);
  private _unlockWithPasskey = inject(UnlockKeyWithPasskey);
  private _pinLockout = inject(PinLockoutService);
  private _modalState = inject(VaultModalState);
  private _vaultKey: WritableSignal<CryptoKey | undefined> = signal(undefined);

  readonly pinLockoutRemainingMs = this._pinLockout.remainingMs;
  readonly isPinLockedOut = computed(() => this._pinLockout.isLocked());
  readonly pinAttemptsRemaining = computed(() => this._pinLockout.attemptsRemaining());

  readonly isUnlockModalOpen = this._modalState.isUnlockOpen;

  readonly repositoryStatus = this._repository.status;

  readonly vaultStatus = computed<VAULT_STATUS>(() => {
    const repoStatus = this._repository.status();
    if (repoStatus !== VAULT_STATUS.ENCRYPTED) {
      return repoStatus;
    }
    return this._vaultKey() ? VAULT_STATUS.DESENCRYPTED : VAULT_STATUS.ENCRYPTED;
  });

  readonly haveUnlockKeyWithPin = computed(() => {
    return this._repository.unlockKeyWithPin() !== undefined;
  });

  readonly haveUnlockKeyWithPasskey = computed(() => {
    return this._repository.unlockKeyWithPasskey() !== undefined;
  });

  readonly isWebAuthnSupported = signal(false);

  constructor() {
    this._checkWebAuthnSupport();
  }

  private async _checkWebAuthnSupport() {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return;
    try {
      const supported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      this.isWebAuthnSupported.set(supported);
    } catch {
      // mantiene false
    }
  }

  readonly isUnlocked = computed(() => this._vaultKey() !== undefined);

  getVaultKey(): CryptoKey | undefined {
    return this._vaultKey();
  }

  private _executePendingOnUnlock = effect(() => {
    if (this.vaultStatus() === VAULT_STATUS.DESENCRYPTED) {
      const action = this._modalState.consumePendingAction();
      if (action) {
        this._modalState.closeUnlock();
        action();
      }
    }
  });

  private _clearPendingOnCancel = effect(() => {
    if (this.vaultStatus() === VAULT_STATUS.ENCRYPTED) {
      this._modalState.clearPendingIfNotOpen();
    }
  });

  async createVault(opts: CreateVaultOptions): Promise<boolean> {
    if (!opts.pin && !opts.withPasskey) {
      throw new Error(VAULT_ERRORS.CREATE_UNLOCK_WITH_PIN);
    }
    const user = this._auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const masterKey = await this._masterKey.generateMasterKey();
    const masterKeyBuffer = await this._masterKey.exportMasterKey(masterKey);
    const created: { id?: string }[] = [];

    try {
      if (opts.pin) {
        const doc = await this._unlockWithPin.createUnlockKey(opts.pin, masterKeyBuffer);
        const added = await firstValueFrom(this._repository.addDoc(doc));
        created.push({ id: added.id });
      }
      if (opts.withPasskey) {
        const attestation = await this._unlockWithPasskey.registerPasskeyAttestation(
          user.uid,
          user.email || undefined,
          user.displayName || undefined,
        );
        const doc = await this._unlockWithPasskey.createUnlockKeyWithPasskey(
          attestation.rawId,
          attestation.credentialId,
          masterKeyBuffer,
        );
        const added = await firstValueFrom(this._repository.addDoc(doc));
        created.push({ id: added.id });
      }
      this._repository.unlockList.reload();
      this._vaultKey.set(masterKey);
      return true;
    } catch (_error) {
      await this._rollbackCreated(created);
      return false;
    }
  }

  private async _rollbackCreated(docs: { id?: string }[]): Promise<void> {
    for (const d of docs) {
      if (!d.id) continue;
      try {
        await firstValueFrom(this._repository.deleteDoc(d.id));
      } catch {
        // ignore rollback failures
      }
    }
  }

  async unlockWithPin(pin: string): Promise<boolean> {
    try {
      if (this._pinLockout.isLocked()) {
        throw new Error(VAULT_ERRORS.TOO_MANY_ATTEMPTS);
      }

      const unlockKey = this._repository.unlockKeyWithPin();
      if (!unlockKey) {
        throw new Error(VAULT_ERRORS.NOT_EXIST_UNLOCK_WITH_PIN);
      }

      const rawMasterKey = await this._unlockWithPin.unlockMasterKey(pin, unlockKey);
      this._vaultKey.set(await this._masterKey.importMasterKey(rawMasterKey));
      this._pinLockout.record(true);
      return true;
    } catch (error) {
      this._pinLockout.record(false);
      throw error;
    }
  }

  async unlockWithPasskey(): Promise<boolean> {
    const unlockKey = this._repository.unlockKeyWithPasskey();
    if (!unlockKey) {
      throw new Error(VAULT_ERRORS.PASSKEY_UNLOCK_FAILED);
    }

    const rawId = await this._unlockWithPasskey.requestAssertion(unlockKey.credentialId);
    const rawMasterKey = await this._unlockWithPasskey.unlockMasterKeyWithPasskey(rawId, unlockKey);
    this._vaultKey.set(await this._masterKey.importMasterKey(rawMasterKey));
    return true;
  }

  lockVault() {
    this._vaultKey.set(undefined);
  }

  showModal(action?: () => void) {
    const s = this.vaultStatus();
    if (s === VAULT_STATUS.ENCRYPTED) {
      this._modalState.openUnlock(action);
    } else if (action) {
      action();
    }
  }

  openUnlockVaultModal() {
    this._modalState.openUnlock();
  }

  closeUnlockModal() {
    this._modalState.closeUnlock();
  }

  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      if (this._pinLockout.isLocked()) {
        throw new Error(VAULT_ERRORS.TOO_MANY_ATTEMPTS);
      }

      const currentUnlockKey = this._repository.unlockKeyWithPin();

      if (!currentUnlockKey) {
        throw new Error(VAULT_ERRORS.NOT_EXIST_UNLOCK_WITH_PIN);
      }

      const updatedUnlockKey = await this._unlockWithPin.changePin(
        oldPin,
        newPin,
        currentUnlockKey,
      );

      await firstValueFrom(this._repository.setDoc(currentUnlockKey.id, updatedUnlockKey));

      this._repository.unlockList.reload();
      this._pinLockout.record(true);
      return true;
    } catch (_error) {
      this._pinLockout.record(false);
      return false;
    }
  }

  async addPin(pin: string): Promise<boolean> {
    const masterKey = this._vaultKey();
    if (!masterKey) return false;
    if (this._repository.unlockKeyWithPin() !== undefined) return false;
    try {
      const masterKeyBuffer = await this._masterKey.exportMasterKey(masterKey);
      const doc = await this._unlockWithPin.createUnlockKey(pin, masterKeyBuffer);
      await firstValueFrom(this._repository.addDoc(doc));
      this._repository.unlockList.reload();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async addPasskey(): Promise<boolean> {
    const masterKey = this._vaultKey();
    if (!masterKey) return false;
    if (this._repository.unlockKeyWithPasskey() !== undefined) return false;
    const user = this._auth.currentUser;
    if (!user) return false;
    try {
      const masterKeyBuffer = await this._masterKey.exportMasterKey(masterKey);
      const attestation = await this._unlockWithPasskey.registerPasskeyAttestation(
        user.uid,
        user.email || undefined,
        user.displayName || undefined,
      );
      const doc = await this._unlockWithPasskey.createUnlockKeyWithPasskey(
        attestation.rawId,
        attestation.credentialId,
        masterKeyBuffer,
      );
      await firstValueFrom(this._repository.addDoc(doc));
      this._repository.unlockList.reload();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async removePin(): Promise<boolean> {
    const doc = this._repository.unlockKeyWithPin();
    if (!doc?.id) return false;
    try {
      await firstValueFrom(this._repository.deleteDoc(doc.id));
      this._repository.unlockList.reload();
      this._pinLockout.reset();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async removePasskey(): Promise<boolean> {
    const doc = this._repository.unlockKeyWithPasskey();
    if (!doc?.id) return false;
    try {
      await firstValueFrom(this._repository.deleteDoc(doc.id));
      this._repository.unlockList.reload();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async replacePasskey(): Promise<boolean> {
    const oldDoc = this._repository.unlockKeyWithPasskey();
    if (!oldDoc?.id) return false;
    const masterKey = this._vaultKey();
    if (!masterKey) return false;
    const user = this._auth.currentUser;
    if (!user) return false;
    let newId: string | undefined;
    try {
      const masterKeyBuffer = await this._masterKey.exportMasterKey(masterKey);
      const attestation = await this._unlockWithPasskey.registerPasskeyAttestation(
        user.uid,
        user.email || undefined,
        user.displayName || undefined,
      );
      const newDoc = await this._unlockWithPasskey.createUnlockKeyWithPasskey(
        attestation.rawId,
        attestation.credentialId,
        masterKeyBuffer,
      );
      const added = await firstValueFrom(this._repository.addDoc(newDoc));
      newId = added.id;
      await firstValueFrom(this._repository.deleteDoc(oldDoc.id));
      this._repository.unlockList.reload();
      return true;
    } catch (_error) {
      if (newId) {
        try {
          await firstValueFrom(this._repository.deleteDoc(newId));
        } catch {
          // ignore
        }
      }
      return false;
    }
  }
}
