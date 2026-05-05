import { Injectable } from '@angular/core';
import { UnlockKeyI } from '../models/unlock-key.model';

@Injectable({
  providedIn: 'root',
})
export class UnlockKeyWithPasskey {

  async createUnlockKeyWithPasskey(
    attestation: ArrayBuffer,
    masterKey: ArrayBuffer
  ): Promise<UnlockKeyI> {

    const hashBuffer = await crypto.subtle.digest('SHA-256', attestation);

    const passkeyKey = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );


    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedMasterKey = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      passkeyKey,
      masterKey
    );

    return {
      encryptedMasterKey: new Uint8Array(encryptedMasterKey),
      iv,
      params: {
        type: 'passkey'
      }
    };
  }

  async unlockMasterKeyWithPasskey(
    assertion: ArrayBuffer,
    unlockKey: UnlockKeyI
  ): Promise<ArrayBuffer> {

    const hashBuffer = await crypto.subtle.digest('SHA-256', assertion);
    const passkeyKey = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const rawMasterKey = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(unlockKey.iv)
      },
      passkeyKey,
      new Uint8Array(unlockKey.encryptedMasterKey)
    );

    return rawMasterKey;
  }

}