import { Injectable, Signal, computed, inject } from '@angular/core';
import { PasswordI } from '../domain/password.interface';
import { FirestoreDataConverter } from '@angular/fire/firestore';
import { ApiBase, PathSegments } from '../../shared/api/api-base';
import { withAddDoc, withCollection, withDocDelete, withQuery } from '../../shared/api/crud.mixins';
import { PasswordCrypto } from './password-crypto';
import { ScopeContext } from '../../shared/scope/scope-context';

@Injectable({
  providedIn: 'root',
})
export class PasswordRepository extends withQuery<PasswordI>()(
  withDocDelete<PasswordI>()(
    withAddDoc<PasswordI>()(withCollection<PasswordI>()(ApiBase<PasswordI>)),
  ),
) {
  private _crypto = inject(PasswordCrypto);
  private readonly _scope = inject(ScopeContext);

  protected override path: Signal<PathSegments> = computed<PathSegments>(() => {
    const s = this._scope.scope();
    if (s === 'global' || s.kind === 'project') return ['passwords'];
    return ['proyectos', s.projectId, 'issues', s.issueId, 'passwords'];
  });

  readonly namespace: Signal<string> = computed<string>(() => {
    const s = this._scope.scope();
    if (s === 'global' || s.kind === 'project') return 'passwords';
    return `proyectos/${s.projectId}/issues/${s.issueId}/passwords`;
  });

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
