import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FileMetadataI, FileItem } from '../models/file.model';
import { FileBlobService } from '../services/file-blob.service';

const IMAGE_PATTERN = /^image\//;

export interface UploadProgress {
  loaded: number;
  total: number;
  pct: number;
}

export interface UploadOptions {
  localId: string;
  onProgress?: (progress: UploadProgress) => void;
}

@Component({
  selector: 'file-input-field',
  templateUrl: './file-input-field.html',
  styleUrl: './file-input-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputField {
  private readonly _upload = inject(FileBlobService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly inputId = input.required<string>();
  readonly multiple = input<boolean>(false);
  readonly accept = input<string>('');
  readonly maxSize = input<number | null>(null);
  readonly maxFiles = input<number | null>(null);
  readonly disabled = input<boolean>(false);
  readonly value = model<readonly FileMetadataI[] | null>(null);
  readonly invalid = output<string>();

  protected readonly items = signal<FileItem[]>([]);
  protected readonly dragOver = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly isBusy = computed(() => this.items().some((i) => i.status === 'uploading'));

  private readonly picker = viewChild<ElementRef<HTMLInputElement>>('picker');

  private readonly _objectUrls = new Map<string, string>();

  private readonly _syncValueEffect = effect(() => {
    const done = this.items()
      .filter((i) => i.status === 'done' && i.metadata)
      .map((i) => i.metadata!);
    this.value.set(done.length > 0 ? done : null);
  });

  constructor() {
    this._destroyRef.onDestroy(() => this._revokeAllObjectUrls());
  }

  protected previewUrl(item: FileItem): string | null {
    if (item.kind === 'local' && item.file) {
      let url = this._objectUrls.get(item.localId);
      if (!url) {
        url = URL.createObjectURL(item.file);
        this._objectUrls.set(item.localId, url);
      }
      return url;
    }
    if (item.kind === 'remote' && item.metadata) {
      let url = this._objectUrls.get(item.localId);
      if (url) return url;
      this._resolveRemoteUrl(item);
      return null;
    }
    return null;
  }

  private _resolveRemoteUrl(item: FileItem): void {
    if (!item.metadata || !item.metadata.id || !item.metadata.mimeType) return;
    const localId = item.localId;
    const fileId = item.metadata.id;
    const mimeType = item.metadata.mimeType;
    of(fileId)
      .pipe(
        switchMap((id) => from(this._upload.getObjectUrl('files', id, mimeType))),
        catchError(() => of(null)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((url) => {
        if (url) {
          this._objectUrls.set(localId, url);
        }
      });
  }

  protected isImage(item: FileItem): boolean {
    const type = item.file?.type ?? item.metadata?.mimeType ?? '';
    return IMAGE_PATTERN.test(type);
  }

  protected formatSize(item: FileItem): string {
    const size = item.file?.size ?? item.metadata?.size ?? 0;
    return this._humanSize(size);
  }

  protected displayName(item: FileItem): string {
    return item.file?.name ?? item.metadata?.name ?? '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    if (this.disabled()) return;
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    this._addFiles(Array.from(files));
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    void event;
  }

  protected onSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    this._addFiles(Array.from(files));
    input.value = '';
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.picker()?.nativeElement.click();
    }
  }

  protected openPicker(): void {
    if (this.disabled()) return;
    this.picker()?.nativeElement.click();
  }

  protected async removeItem(item: FileItem): Promise<void> {
    this._revokeObjectUrl(item.localId);
    if (item.kind === 'remote' && item.metadata?.id) {
      try {
        await this._upload.deleteFile('files', item.metadata.id);
      } catch (err) {
        console.error('[FileInputField] failed to delete file', err);
      }
    }
    this.items.update((arr) => arr.filter((i) => i.localId !== item.localId));
  }

  protected async retry(item: FileItem): Promise<void> {
    if (item.kind !== 'local' || !item.file) return;
    this.items.update((arr) =>
      arr.map((i) =>
        i.localId === item.localId
          ? { ...i, status: 'uploading', progress: 0, error: undefined }
          : i,
      ),
    );
    try {
      const metadata = await this._upload.upload(item.file, 'files', {
        onProgress: (p) => this._updateItemProgress(item.localId, p.pct),
      });
      this._replaceItem(item.localId, {
        kind: 'remote',
        localId: item.localId,
        file: undefined,
        metadata,
        progress: 100,
        status: 'done',
      });
    } catch (err) {
      this._markItemError(item.localId, this._humanizeError(err));
    }
  }

  protected fileName(item: FileItem): string {
    return this.displayName(item);
  }

  protected ariaLabelRemove(item: FileItem): string {
    return `Quitar ${this.displayName(item)}`;
  }

  private _addFiles(files: File[]): void {
    const accepted = this._acceptAndValidate(files);
    if (accepted === null) {
      return;
    }

    if (!this.multiple()) {
      const existing = this.items();
      existing.forEach((i) => this._revokeObjectUrl(i.localId));
      this.items.set([]);
    }

    accepted.forEach((file) => this._uploadNew(file));
  }

  private _acceptAndValidate(files: File[]): File[] | null {
    if (!this.multiple() && files.length > 1) {
      this._emitError('Solo se permite un archivo');
      return null;
    }

    const maxSize = this.maxSize();
    const accept = this.accept();
    const filtered: File[] = [];

    for (const file of files) {
      if (maxSize != null && file.size > maxSize) {
        this._emitError(`"${file.name}" excede el tamaño máximo`);
        return null;
      }
      if (accept && !this._matchesAccept(file, accept)) {
        this._emitError(`"${file.name}" no coincide con los tipos permitidos`);
        return null;
      }
      filtered.push(file);
    }

    const max = this.maxFiles();
    if (this.multiple() && max != null) {
      const room = max - this.items().length;
      if (room <= 0) {
        this._emitError(`Máximo ${max} archivos`);
        return null;
      }
      if (filtered.length > room) {
        return filtered.slice(0, room);
      }
    }

    this.errorMsg.set(null);
    return filtered;
  }

  private _emitError(message: string): void {
    this.errorMsg.set(message);
    this.invalid.emit(message);
  }

  private _matchesAccept(file: File, accept: string): boolean {
    const tokens = accept
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) return true;
    for (const token of tokens) {
      if (token === file.type) return true;
      if (token.endsWith('/*') && file.type.startsWith(token.slice(0, -1))) return true;
      if (token.startsWith('.') && file.name.toLowerCase().endsWith(token.toLowerCase()))
        return true;
    }
    return false;
  }

  private _uploadNew(file: File): void {
    const localId = crypto.randomUUID();
    const newItem: FileItem = {
      kind: 'local',
      localId,
      file,
      progress: 0,
      status: 'uploading',
    };
    this.items.update((arr) => [...arr, newItem]);
    this._startUpload(newItem);
  }

  private _startUpload(item: FileItem): void {
    if (!item.file) return;
    this._upload
      .upload(item.file, 'files', {
        onProgress: (p) => this._updateItemProgress(item.localId, p.pct),
      })
      .then((metadata) => {
        this._replaceItem(item.localId, {
          kind: 'remote',
          localId: item.localId,
          metadata,
          progress: 100,
          status: 'done',
        });
      })
      .catch((err) => {
        this._markItemError(item.localId, this._humanizeError(err));
      });
  }

  private _updateItemProgress(localId: string, pct: number): void {
    this.items.update((arr) =>
      arr.map((i) => (i.localId === localId ? { ...i, progress: pct } : i)),
    );
  }

  private _replaceItem(localId: string, next: FileItem): void {
    this.items.update((arr) => arr.map((i) => (i.localId === localId ? next : i)));
  }

  private _markItemError(localId: string, message: string): void {
    this.items.update((arr) =>
      arr.map((i) => (i.localId === localId ? { ...i, status: 'error', error: message } : i)),
    );
  }

  private _revokeObjectUrl(localId: string): void {
    const url = this._objectUrls.get(localId);
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    this._objectUrls.delete(localId);
  }

  private _revokeAllObjectUrls(): void {
    for (const [localId, url] of this._objectUrls) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      this._objectUrls.delete(localId);
    }
  }

  private _humanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  private _humanizeError(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Error al subir el archivo';
  }
}
