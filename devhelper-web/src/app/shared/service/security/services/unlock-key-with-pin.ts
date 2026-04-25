import { Injectable } from '@angular/core';
import { UnlockKeyI } from '../models/unlock-key.model';

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
      encryptedMasterKey,
      salt,
      iv,
      params: {
        iterations: 100000
      },
    };
  }

  async unlockMasterKey(
    pin: string,
    unlockKey: UnlockKeyI
  ): Promise<ArrayBuffer> {
    if (!unlockKey.salt) {
      throw new Error('Salt is missing');
    }
    const pinKey = await this.deriveKey(
      pin,
      new Uint8Array(unlockKey.salt)
    );

    const rawMasterKey = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(unlockKey.iv) },
      pinKey,
      unlockKey.encryptedMasterKey
    );

    return rawMasterKey;
  }

}