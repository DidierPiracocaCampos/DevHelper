import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MasterKey {

  async generateMasterKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async exportMasterKey(key: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.exportKey('raw', key);
  }

  async importMasterKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encryptVaultItem(
    masterKey: CryptoKey,
    plaintext: string
  ): Promise<{
    ciphertext: ArrayBuffer;
    iv: Uint8Array;
  }> {

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      masterKey,
      encoder.encode(plaintext)
    );

    return {
      ciphertext,
      iv
    };
  }

  async decryptVaultItem(
    masterKey: CryptoKey,
    ciphertext: ArrayBuffer,
    iv: Uint8Array
  ): Promise<string> {

    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      masterKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(plaintextBuffer);
  }

}