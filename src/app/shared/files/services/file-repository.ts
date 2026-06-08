import { Injectable, Signal, computed, inject } from '@angular/core';
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { ApiBase, PathSegments } from '../../api/api-base';
import { withCollection, withDocById, withDocDelete } from '../../api/crud.mixins';
import { FileMetadataI } from '../models/file.model';
import { BlobNamespace } from '../models/blob-chunk.model';
import { ScopeContext } from '../../scope/scope-context';

@Injectable({ providedIn: 'root' })
export class FileRepository extends withDocDelete()(
  withDocById<FileMetadataI>()(
    withCollection<FileMetadataI>()(ApiBase<FileMetadataI>),
  ),
) {
  private readonly _scope = inject(ScopeContext);

  protected override path: Signal<PathSegments> = computed<PathSegments>(() => {
    const s = this._scope.scope();
    if (s === 'global') return ['files'];
    return ['proyectos', s.projectId, 'issues', s.issueId, 'files'];
  });

  readonly namespace: Signal<BlobNamespace> = computed<BlobNamespace>(() => {
    const s = this._scope.scope();
    if (s === 'global') return 'files';
    return `proyectos/${s.projectId}/issues/${s.issueId}/files`;
  });

  protected override converter: FirestoreDataConverter<FileMetadataI, DocumentData> = {
    toFirestore(data: FileMetadataI): DocumentData {
      return {
        name: data.name,
        size: data.size,
        mimeType: data.mimeType,
        chunkCount: data.chunkCount,
        updatedAt: data.updatedAt,
        encrypted: data.encrypted ?? false,
        iv: data.iv ?? null,
        tags: data.tags ?? [],
        createdAt: data.createdAt,
      };
    },

    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      _options: SnapshotOptions,
    ): FileMetadataI {
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

  readonly files = this.getCollection();
}
