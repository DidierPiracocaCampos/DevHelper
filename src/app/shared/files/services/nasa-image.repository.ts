import { Injectable, signal } from '@angular/core';
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { ApiBase } from '../../api/api-base';
import { withDocById, withDocDelete } from '../../api/crud.mixins';
import { EncryptedFileMetadataI } from './file-blob.service';

@Injectable({ providedIn: 'root' })
export class NasaImageRepository extends withDocDelete()(
  withDocById<EncryptedFileMetadataI>()(ApiBase<EncryptedFileMetadataI>),
) {
  protected path = signal(['nasa-image'] as const);

  protected converter: FirestoreDataConverter<EncryptedFileMetadataI, DocumentData> = {
    toFirestore(data: EncryptedFileMetadataI): DocumentData {
      return {
        name: data.name,
        size: data.size,
        type: data.type,
        chunkCount: data.chunkCount,
        updatedAt: data.updatedAt,
        encrypted: data.encrypted,
        iv: data.iv ?? null,
      };
    },

    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      _options: SnapshotOptions,
    ): EncryptedFileMetadataI {
      const data = snapshot.data() as {
        name?: string;
        size?: number;
        type?: string;
        chunkCount?: number;
        updatedAt?: number;
        encrypted?: boolean;
        iv?: number[] | null;
      };
      return {
        name: data.name ?? '',
        size: data.size ?? 0,
        type: data.type ?? 'application/octet-stream',
        chunkCount: data.chunkCount ?? 1,
        updatedAt: data.updatedAt ?? 0,
        encrypted: data.encrypted ?? false,
        iv: data.iv ?? null,
      };
    },
  };
}
