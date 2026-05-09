import { Injectable } from '@angular/core';
import { UnlockKeyI } from '../models/unlock-key.model';
import { VAULT_ERRORS } from '../models/vault.model';

@Injectable({
  providedIn: 'root',
})
export class UnlockKeyWithPin {

  private encoder = new TextEncoder();

  private async deriveKey(pin: string, salt: BufferSource): Promise<CryptoKey> {

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(pin),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async createUnlockKey(
    pin: string,
    masterKey: ArrayBuffer
  ): Promise<UnlockKeyI> {

    const salt = crypto.getRandomValues(new Uint8Array(16));

    const pinKey = await this.deriveKey(pin, salt);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedMasterKey = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      pinKey,
      masterKey
    );

    return {
      encryptedMasterKey: new Uint8Array(encryptedMasterKey),
      salt,
      iv,
      params: {
        iterations: 100000
      },
    };
  }

  async changePin(
    oldPin: string,
    newPin: string,
    currentUnlockKey: UnlockKeyI
  ): Promise<UnlockKeyI> {
    let masterKey: ArrayBuffer;
    try {
      masterKey = await this.unlockMasterKey(oldPin, currentUnlockKey);
    } catch (error) {
      throw new Error(VAULT_ERRORS.INCORRECT_PIN_TO_UNLOCK_WITH_PIN);
    }
    const newUnlockKey = await this.createUnlockKey(newPin, masterKey);
    masterKey = new ArrayBuffer(0);
    return newUnlockKey;
  }

  async unlockMasterKey(
    pin: string,
    unlockKey: UnlockKeyI
  ): Promise<ArrayBuffer> {
    if (!unlockKey.salt) {
      throw new Error(VAULT_ERRORS.SALT_IS_MISSING);
    }
    const pinKey = await this.deriveKey(
      pin,
      new Uint8Array(unlockKey.salt)
    );

    const rawMasterKey = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(unlockKey.iv) },
      pinKey,
      new Uint8Array(unlockKey.encryptedMasterKey)
    );

    return rawMasterKey;
  }

}