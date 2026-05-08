import { computed, Injectable } from '@angular/core';
import { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { UnlockKeyI } from '../models/unlock-key.model';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { VAULT_STATUS } from '../models/vault.model';
import { fromBase64, toBase64 } from './utils';
import { BaseRepository } from '../../service/repository-base';

@Injectable({
  providedIn: 'root',
})
export class VaultRepository extends BaseRepository<UnlockKeyI> {

  protected override path: [string, ...string[]] = ['vault'];
  protected override converter: FirestoreDataConverter<UnlockKeyI, DocumentData> = {
    toFirestore(vault: UnlockKeyI): DocumentData {
      const data: DocumentData = {
        encryptedMasterKey: toBase64(vault.encryptedMasterKey),
        iv: toBase64(vault.iv),
      };
      if (vault.salt) {
        data['salt'] = toBase64(vault.salt);
      }
      return data;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UnlockKeyI {
      const data = snapshot.data(options);

      return {
        id: snapshot.id,
        encryptedMasterKey: fromBase64(data['encryptedMasterKey']),
        salt: data['salt'] ? fromBase64(data['salt']) : undefined,
        iv: fromBase64(data['iv']),
        params: data['params'],
      };
    }
  };

  readonly unlockList = this.getAllResource();

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
    return this.unlockList.value()?.find((v) => v.salt != undefined);
  });

  readonly unlockKeyWithPasskey = computed(() => {
    const status = this.status();
    if (status == VAULT_STATUS.NO_CREATE || status == VAULT_STATUS.ERROR) {
      return undefined;
    }
    return this.unlockList.value()?.find((v) => v.salt === undefined);
  });

  async hasVaultKey(): Promise<boolean> {
    const stored = await firstValueFrom(this.getAll());
    return !!stored && stored.length > 0;
  }

}