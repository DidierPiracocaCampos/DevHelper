import { Injectable, inject } from '@angular/core';
import { PasswordI, EncryptedData } from '../domain/password.interface';
import { FirestoreDataConverter } from '@angular/fire/firestore';
import { ApiBase } from '../../shared/api/api-base';
import { withCollection } from '../../shared/api/crud.mixins';
import { withAddDoc } from '../../shared/api/crud.mixins';
import { withDocDelete } from '../../shared/api/crud.mixins';
import { MasterKey } from '../../shared/security/services/master-key';

@Injectable({
  providedIn: 'root',
})
export class PasswordRepository extends withDocDelete<PasswordI>()(
  withAddDoc<PasswordI>()(withCollection<PasswordI>()(ApiBase<PasswordI>)),
) {
  private _masterKey = inject(MasterKey);

  protected path: [string, ...string[]] = ['passwords'];

  protected converter: FirestoreDataConverter<PasswordI> = {
    toFirestore: (data: PasswordI) => data,
    fromFirestore: (snap) => snap.data() as PasswordI,
  };

  async encryptPassword(plaintext: string, vaultKey: CryptoKey): Promise<EncryptedData> {
    const { ciphertext, iv } = await this._masterKey.encryptVaultItem(vaultKey, plaintext);
    return {
      cipher: Array.from(new Uint8Array(ciphertext)),
      iv: Array.from(iv),
    };
  }

  async decryptPassword(data: EncryptedData, vaultKey: CryptoKey): Promise<string> {
    const ciphertext = new Uint8Array(data.cipher).buffer;
    const iv = new Uint8Array(data.iv);
    return this._masterKey.decryptVaultItem(vaultKey, ciphertext, iv);
  }
}
