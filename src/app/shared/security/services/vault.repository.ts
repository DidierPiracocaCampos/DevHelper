import { computed, Injectable, signal } from '@angular/core';
import {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { UnlockKeyI } from '../models/unlock-key.model';
import { VAULT_STATUS } from '../models/vault.model';
import { fromBase64, toBase64 } from './utils';
import { ApiBase } from '../../api/api-base';
import { withCollection } from '../../api/crud.mixins';
import { withAddDoc } from '../../api/crud.mixins';
import { withDocDelete } from '../../api/crud.mixins';
import { withSetDoc } from '../../api/crud.mixins';

function migrateParams(raw: unknown, salt: Uint8Array | undefined): UnlockKeyI['params'] {
  if (raw && typeof raw === 'object') {
    const r = raw as { iterations?: unknown; type?: unknown };
    if (r.type === 'passkey') {
      return { type: 'passkey' };
    }
    if (r.type === 'pin' && typeof r.iterations === 'number') {
      return { iterations: r.iterations, type: 'pin' };
    }
    if (typeof r.iterations === 'number') {
      return { iterations: r.iterations, type: 'pin' };
    }
  }
  return salt ? { iterations: 600000, type: 'pin' } : { type: 'passkey' };
}

@Injectable({
  providedIn: 'root',
})
export class VaultRepository extends withSetDoc<UnlockKeyI>()(
  withAddDoc<UnlockKeyI>()(
    withDocDelete<UnlockKeyI>()(withCollection<UnlockKeyI>()(ApiBase<UnlockKeyI>)),
  ),
) {
  protected path = signal(['vault'] as const);
  protected converter: FirestoreDataConverter<UnlockKeyI, DocumentData> = {
    toFirestore(vault: UnlockKeyI): DocumentData {
      const data: DocumentData = {
        encryptedMasterKey: toBase64(vault.encryptedMasterKey),
        iv: toBase64(vault.iv),
        params: vault.params,
      };
      if (vault.salt) {
        data['salt'] = toBase64(vault.salt);
      }
      if (vault.credentialId) {
        data['credentialId'] = vault.credentialId;
      }
      return data;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UnlockKeyI {
      const data = snapshot.data(options);
      const salt = data['salt'] ? fromBase64(data['salt']) : undefined;
      const params = migrateParams(data['params'], salt);
      const credentialId =
        typeof data['credentialId'] === 'string' ? data['credentialId'] : undefined;

      return {
        id: snapshot.id,
        encryptedMasterKey: fromBase64(data['encryptedMasterKey']),
        salt,
        iv: fromBase64(data['iv']),
        params,
        credentialId,
      };
    },
  };

  readonly unlockList = this.getCollection();

  readonly status = computed<VAULT_STATUS>(() => {
    const list = this.unlockList;
    if (list.isLoading()) return VAULT_STATUS.LOADING;
    const error = list.error();
    if (error) return VAULT_STATUS.ERROR;
    const value = list.value();
    if (!value || value.length === 0) {
      return VAULT_STATUS.NO_CREATE;
    }
    return VAULT_STATUS.ENCRYPTED;
  });

  readonly unlockKeyWithPin = computed(() => {
    const status = this.status();
    if (status == VAULT_STATUS.NO_CREATE || status == VAULT_STATUS.ERROR) {
      return undefined;
    }
    return this.unlockList.value()?.find((v: UnlockKeyI) => v.params?.type === 'pin');
  });

  readonly unlockKeyWithPasskey = computed(() => {
    const status = this.status();
    if (status == VAULT_STATUS.NO_CREATE || status == VAULT_STATUS.ERROR) {
      return undefined;
    }
    return this.unlockList.value()?.find((v: UnlockKeyI) => v.params?.type === 'passkey');
  });

  hasVaultKey(): boolean {
    const value = this.unlockList.value();
    return !!value && value.length > 0;
  }
}
