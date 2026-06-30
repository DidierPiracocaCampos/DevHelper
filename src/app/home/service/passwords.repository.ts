import { Injectable, inject, signal } from '@angular/core';
import { PasswordI } from '../domain/password.interface';
import { FirestoreDataConverter } from '@angular/fire/firestore';
import { ApiBase } from '../../shared/api/api-base';
import { withAddDoc, withCollection, withDocDelete, withQuery } from '../../shared/api/crud.mixins';
import { PasswordCrypto } from './password-crypto';

@Injectable({
  providedIn: 'root',
})
export class PasswordRepository extends withQuery<PasswordI>()(
  withDocDelete<PasswordI>()(
    withAddDoc<PasswordI>()(withCollection<PasswordI>()(ApiBase<PasswordI>)),
  ),
) {
  private _crypto = inject(PasswordCrypto);

  protected path = signal(['passwords'] as const);

  protected converter: FirestoreDataConverter<PasswordI> = {
    toFirestore: (data: PasswordI) => {
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore: (snap) => snap.data() as PasswordI,
  };

  encryptPassword(plaintext: string, vaultKey: CryptoKey) {
    return this._crypto.encrypt(plaintext, vaultKey);
  }

  decryptPassword(data: PasswordI['password'], vaultKey: CryptoKey) {
    return this._crypto.decrypt(data, vaultKey);
  }
}
