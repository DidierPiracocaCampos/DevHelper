import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Authenticator } from '../../service/authenticator';
import { FileMetadataI } from '../models/file.model';
import { FileRepository } from './file-repository';

export interface UploadProgress {
  loaded: number;
  total: number;
  pct: number;
}

export interface UploadOptions {
  localId: string;
  onProgress?: (progress: UploadProgress) => void;
}

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly _storage = inject(Storage);
  private readonly _auth = inject(Authenticator);
  private readonly _repository = inject(FileRepository);
  private readonly _destroyRef = inject(DestroyRef);

  readonly progress = signal<ReadonlyMap<string, UploadProgress>>(new Map());

  async upload(file: File, options: UploadOptions): Promise<FileMetadataI & { id: string }> {
    const user = this._auth.user();
    if (!user) {
      throw new Error('No authenticated user');
    }

    const fileId = crypto.randomUUID();
    const safeName = this._sanitizeFilename(file.name);
    const storagePath = `users/${user.uid}/files/${fileId}/${safeName}`;
    const storageRef = ref(this._storage, storagePath);

    const task = uploadBytesResumable(storageRef, file);
    const { localId, onProgress } = options;

    this._trackProgress(task, localId, file.size, onProgress);

    await task;

    const metadata: FileMetadataI = {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      storagePath,
      uploadedAt: Date.now(),
    };

    return new Promise<FileMetadataI & { id: string }>((resolve, reject) => {
      this._repository.addDoc(metadata).subscribe({
        next: (saved) => {
          this._clearProgress(localId);
          resolve(saved);
        },
        error: (err) => {
          this._markProgressError(localId, err);
          reject(err);
        },
      });
    });
  }

  async deleteFile(metadata: FileMetadataI & { id?: string }): Promise<void> {
    if (!metadata.storagePath) {
      throw new Error('File metadata is missing storagePath');
    }
    const storageRef = ref(this._storage, metadata.storagePath);
    await deleteObject(storageRef);
    if (metadata.id) {
      await new Promise<void>((resolve, reject) => {
        this._repository.deleteDoc(metadata.id!).subscribe({
          next: () => resolve(),
          error: (err) => reject(err),
        });
      });
    }
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    if (!storagePath) {
      throw new Error('storagePath is required');
    }
    const storageRef = ref(this._storage, storagePath);
    return getDownloadURL(storageRef);
  }

  private _trackProgress(
    task: ReturnType<typeof uploadBytesResumable>,
    localId: string,
    total: number,
    onProgress?: (progress: UploadProgress) => void,
  ): void {
    const unsubscribe = task.on(
      'state_changed',
      (snapshot) => {
        const loaded = snapshot.bytesTransferred;
        const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
        const progress: UploadProgress = { loaded, total, pct };
        this._updateProgress(localId, progress);
        onProgress?.(progress);
      },
      (error) => {
        this._markProgressError(localId, error);
        onProgress?.({ loaded: 0, total: 0, pct: 0 });
      },
    );

    this._destroyRef.onDestroy(() => {
      try {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch {
        // task may have already settled
      }
    });
  }

  private _updateProgress(localId: string, progress: UploadProgress): void {
    this.progress.update((current) => {
      const next = new Map(current);
      next.set(localId, progress);
      return next;
    });
  }

  private _markProgressError(localId: string, error: unknown): void {
    console.error(`[FileUploadService] upload error for ${localId}:`, error);
  }

  private _clearProgress(localId: string): void {
    this.progress.update((current) => {
      if (!current.has(localId)) return current;
      const next = new Map(current);
      next.delete(localId);
      return next;
    });
  }

  private _sanitizeFilename(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 120) || 'file';
  }
}
