import { inject, Injectable } from '@angular/core';
import { EncryptedData } from '../domain/password.interface';
import { MasterKey } from '../../shared/security/services/master-key';

@Injectable({
  providedIn: 'root',
})
export class PasswordCrypto {
  private _masterKey = inject(MasterKey);

  async encrypt(plaintext: string, vaultKey: CryptoKey): Promise<EncryptedData> {
    const { ciphertext, iv } = await this._masterKey.encryptVaultItem(vaultKey, plaintext);
    return {
      cipher: Array.from(new Uint8Array(ciphertext)),
      iv: Array.from(iv),
    };
  }

  async decrypt(data: EncryptedData, vaultKey: CryptoKey): Promise<string> {
    const ciphertext = new Uint8Array(data.cipher).buffer;
    const iv = new Uint8Array(data.iv);
    return this._masterKey.decryptVaultItem(vaultKey, ciphertext, iv);
  }
}
