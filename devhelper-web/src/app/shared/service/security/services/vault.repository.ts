import { Injectable } from '@angular/core';
import { BaseRepository } from '../../repository-base';
import { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { UnlockKeyI } from '../models/unlock-key.model';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable({
  providedIn: 'root',
})
export class VaultRepository extends BaseRepository<UnlockKeyI> {

  protected override path: [string, ...string[]] = ['vault'];
  
  protected override converter: FirestoreDataConverter<UnlockKeyI, DocumentData> = {
    toFirestore(vault: UnlockKeyI): DocumentData {
      return vault;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UnlockKeyI {
      const data = snapshot.data(options);
      return data as UnlockKeyI;
    }
  };

  async hasVaultKey(): Promise<boolean> {
    const stored = await firstValueFrom(this.getAll());
    return !!stored && stored.length > 0;
  }

}