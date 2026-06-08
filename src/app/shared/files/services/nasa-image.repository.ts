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
        mimeType: data.mimeType,
        chunkCount: data.chunkCount,
        updatedAt: data.updatedAt,
        encrypted: data.encrypted,
        iv: data.iv ?? null,
        tags: data.tags ?? [],
        createdAt: data.createdAt,
      };
    },

    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      _options: SnapshotOptions,
    ): EncryptedFileMetadataI {
      const data = snapshot.data() as {
        name?: string;
        size?: number;
        mimeType?: string;
        chunkCount?: number;
        updatedAt?: number;
        encrypted?: boolean;
        iv?: string | null;
        tags?: string[];
        createdAt?: number;
      };
      return {
        id: snapshot.id,
        name: data.name ?? '',
        size: data.size ?? 0,
        mimeType: data.mimeType ?? 'application/octet-stream',
        chunkCount: data.chunkCount ?? 1,
        updatedAt: data.updatedAt ?? 0,
        encrypted: data.encrypted ?? false,
        iv: data.iv ?? null,
        tags: data.tags ?? [],
        createdAt: data.createdAt ?? 0,
      };
    },
  };
}
