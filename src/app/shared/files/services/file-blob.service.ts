import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import {
  Bytes,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Authenticator } from '../../service/authenticator';
import { FileMetadataI } from '../models/file.model';
import {
  BLOB_CHUNK_SIZE,
  BLOB_MAX_FILE_SIZE,
  BlobNamespace,
} from '../models/blob-chunk.model';

export type { FileMetadataI } from '../models/file.model';

export interface BlobUploadOptions {
  onProgress?: (progress: { loaded: number; total: number; pct: number }) => void;
  encryptWith?: CryptoKey;
}

export interface EncryptedFileMetadataI extends FileMetadataI {
  encrypted: boolean;
  iv?: number[] | null;
}

export class BlobValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlobValidationError';
  }
}

@Injectable({ providedIn: 'root' })
export class FileBlobService {
  private readonly _firestore = inject(Firestore);
  private readonly _auth = inject(Authenticator);
  private readonly _injector = inject(Injector);

  readonly CHUNK_SIZE = BLOB_CHUNK_SIZE;
  readonly MAX_FILE_SIZE = BLOB_MAX_FILE_SIZE;

  static splitIntoChunks(
    file: File,
    chunkSize: number = BLOB_CHUNK_SIZE,
  ): { index: number; start: number; end: number }[] {
    const chunkCount = Math.max(1, Math.ceil(file.size / chunkSize));
    const chunks: { index: number; start: number; end: number }[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      chunks.push({ index: i, start, end });
    }
    return chunks;
  }

  static computeMetadata(
    file: File,
    id: string,
    encryptWith: CryptoKey | undefined,
  ): { metadata: EncryptedFileMetadataI; iv: Uint8Array | null } {
    const chunkCount = Math.max(1, Math.ceil(file.size / BLOB_CHUNK_SIZE));
    const iv = encryptWith ? crypto.getRandomValues(new Uint8Array(12)) : null;
    return {
      metadata: {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        chunkCount,
        updatedAt: Date.now(),
        encrypted: !!encryptWith,
        iv: iv ? Array.from(iv) : null,
      },
      iv,
    };
  }

  async upload(
    file: File,
    namespace: BlobNamespace,
    options: BlobUploadOptions = {},
  ): Promise<EncryptedFileMetadataI & { id: string }> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BlobValidationError(
        `"${file.name}" excede el tamaño máximo (${Math.floor(this.MAX_FILE_SIZE / 1024 / 1024)} MB)`,
      );
    }

    const user = this._auth.user();
    if (!user) {
      throw new Error('No authenticated user');
    }

    const id = crypto.randomUUID();
    const { metadata, iv } = FileBlobService.computeMetadata(file, id, options.encryptWith);

    options.onProgress?.({ loaded: 0, total: file.size, pct: 0 });

    for (const chunk of FileBlobService.splitIntoChunks(file, this.CHUNK_SIZE)) {
      const slice = await file.slice(chunk.start, chunk.end).arrayBuffer();
      const plain = new Uint8Array(slice);
      const dataBytes = options.encryptWith && iv
        ? new Uint8Array(
            await crypto.subtle.encrypt(
              { name: 'AES-GCM', iv: iv as unknown as BufferSource },
              options.encryptWith,
              plain,
            ),
          )
        : plain;

      const bytes = Bytes.fromUint8Array(dataBytes);

      await runInInjectionContext(this._injector, async () => {
        const chunkRef = doc(
          this._firestore,
          'users',
          user.uid,
          namespace,
          id,
          'chunks',
          String(chunk.index),
        );
        await setDoc(chunkRef, { index: chunk.index, data: bytes });
      });

      options.onProgress?.({
        loaded: chunk.end,
        total: file.size,
        pct: Math.round((chunk.end / file.size) * 100),
      });
    }

    await runInInjectionContext(this._injector, async () => {
      const metaRef = doc(this._firestore, 'users', user.uid, namespace, id);
      await setDoc(metaRef, this._toFirestore(metadata));
    });

    return { id, ...metadata };
  }

  async deleteFile(namespace: BlobNamespace, id: string): Promise<void> {
    const user = this._auth.user();
    if (!user) {
      throw new Error('No authenticated user');
    }

    await runInInjectionContext(this._injector, async () => {
      const chunksRef = collection(
        this._firestore,
        'users',
        user.uid,
        namespace,
        id,
        'chunks',
      );
      const chunkSnap = await getDocs(chunksRef);
      const batch = writeBatch(this._firestore);
      chunkSnap.forEach((c) => batch.delete(c.ref));
      batch.delete(doc(this._firestore, 'users', user.uid, namespace, id));
      await batch.commit();
    });
  }

  async getBytes(
    namespace: BlobNamespace,
    id: string,
    decryptWith?: CryptoKey,
  ): Promise<Uint8Array> {
    const user = this._auth.user();
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { meta, sorted } = await runInInjectionContext(this._injector, async () => {
      const metaRef = doc(this._firestore, 'users', user.uid, namespace, id);
      const metaSnap = await getDoc(metaRef);
      if (!metaSnap.exists()) {
        throw new Error(`Blob ${namespace}/${id} not found`);
      }
      const meta = metaSnap.data() as EncryptedFileMetadataI;

      const chunksRef = collection(
        this._firestore,
        'users',
        user.uid,
        namespace,
        id,
        'chunks',
      );
      const chunkSnap = await getDocs(query(chunksRef, where('index', '>=', 0)));
      const sorted = chunkSnap.docs
        .map((d) => d.data() as { index: number; data: Bytes | Uint8Array })
        .sort((a, b) => a.index - b.index);

      return { meta, sorted };
    });

    const parts: Uint8Array[] = [];
    for (const c of sorted) {
      const bytes = c.data instanceof Bytes ? c.data.toUint8Array() : c.data;
      if (decryptWith && meta.iv) {
        const slice = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;
        const plain = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(meta.iv) },
          decryptWith,
          slice,
        );
        parts.push(new Uint8Array(plain));
      } else {
        parts.push(bytes);
      }
    }

    return FileBlobService.concatenateChunks(parts);
  }

  async getObjectUrl(
    namespace: BlobNamespace,
    id: string,
    type: string,
    decryptWith?: CryptoKey,
  ): Promise<string> {
    const bytes = await this.getBytes(namespace, id, decryptWith);
    const slice = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
    const blob = new Blob([slice], { type });
    return URL.createObjectURL(blob);
  }

  static concatenateChunks(parts: Uint8Array[]): Uint8Array {
    const total = parts.reduce((acc, p) => acc + p.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const p of parts) {
      out.set(p, offset);
      offset += p.length;
    }
    return out;
  }

  private _toFirestore(meta: EncryptedFileMetadataI): Record<string, unknown> {
    return {
      name: meta.name,
      size: meta.size,
      type: meta.type,
      chunkCount: meta.chunkCount,
      updatedAt: meta.updatedAt,
      encrypted: meta.encrypted,
      iv: meta.iv ?? null,
    };
  }
}
