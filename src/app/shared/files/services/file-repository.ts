import { Injectable, signal } from '@angular/core';
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { ApiBase } from '../../api/api-base';
import { withCollection, withAddDoc, withUpdateDoc, withDocById, withDocDelete } from '../../api/crud.mixins';
import { FileMetadataI } from '../models/file.model';

@Injectable({ providedIn: 'root' })
export class FileRepository extends withDocDelete()(
  withUpdateDoc<FileMetadataI>()(
    withDocById<FileMetadataI>()(
      withAddDoc<FileMetadataI>()(withCollection<FileMetadataI>()(ApiBase<FileMetadataI>)),
    ),
  ),
) {
  protected path = signal(['files'] as const);

  protected converter: FirestoreDataConverter<FileMetadataI, DocumentData> = {
    toFirestore(metadata: FileMetadataI): DocumentData {
      return {
        name: metadata.name,
        size: metadata.size,
        type: metadata.type,
        storagePath: metadata.storagePath,
        uploadedAt: metadata.uploadedAt,
      };
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): FileMetadataI {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        name: data['name'],
        size: data['size'],
        type: data['type'],
        storagePath: data['storagePath'],
        uploadedAt: data['uploadedAt'],
      };
    },
  };

  readonly files = this.getCollection();
}
