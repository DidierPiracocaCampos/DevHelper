import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { BlobNamespace, BLOB_MAX_FILE_SIZE, FileBlobService, FileMetadataI } from '../../files';
import { VaultSecurity } from '../../security';
import { ToastService } from '../../service/toast';
import { ConfirmService } from '../../service/confirm.service';
import { UiModal } from '../ui-modal/ui-modal';
import { UiButton } from '../ui-button/button';
import { UiAlert } from '../ui-alert/ui-alert';

export interface AddFileItem {
  localId: string;
  file: File;
  previewUrl: string | null;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  metadata?: FileMetadataI & { id: string };
}

const IMAGE_PATTERN = /^image\//;

@Component({
  selector: 'ui-add-file',
  imports: [UiModal, UiButton, UiAlert],
  templateUrl: './ui-add-file.html',
  styleUrl: './ui-add-file.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiAddFile {
  private readonly _blob = inject(FileBlobService);
  private readonly _vault = inject(VaultSecurity);
  private readonly _toast = inject(ToastService);
  private readonly _confirm = inject(ConfirmService);

  isOpen = model<boolean>(false);
  namespace = input.required<BlobNamespace>();
  encrypt = input<boolean>(false);
  maxSize = input<number>(BLOB_MAX_FILE_SIZE);

  added = output<(FileMetadataI & { id: string })[]>();
  closed = output<void>();

  protected readonly _items: WritableSignal<AddFileItem[]> = signal<AddFileItem[]>([]);
  protected readonly _busy = computed(() => this._items().some((i) => i.status === 'uploading'));
  protected readonly _canUpload = computed(() => {
    const items = this._items();
    return items.length > 0 && !this._busy();
  });
  protected readonly _hasPending = computed(() =>
    this._items().some((i) => i.status === 'pending' || i.status === 'uploading'),
  );

  hasPending = this._hasPending;

  protected readonly _picker = viewChild<ElementRef<HTMLInputElement>>('picker');
  protected readonly _dropOver = signal(false);
  protected readonly _errorMsg = signal<string | null>(null);

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (!open) {
        this._items.set([]);
        this._errorMsg.set(null);
      }
    });
  }

  protected openPicker(): void {
    this._picker()?.nativeElement.click();
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    this._accept(Array.from(files));
    input.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this._dropOver.set(false);
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    this._accept(Array.from(files));
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this._dropOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this._dropOver.set(false);
  }

  protected removeItem(item: AddFileItem): void {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    this._items.update((arr) => arr.filter((i) => i.localId !== item.localId));
  }

  protected async uploadAll(): Promise<void> {
    const items = this._items().filter((i) => i.status === 'pending');
    if (items.length === 0) return;

    const doUpload = async (): Promise<void> => {
      const added: (FileMetadataI & { id: string })[] = [];
      for (const item of items) {
        this._markStatus(item.localId, 'uploading');
        try {
          const key = this.encrypt() ? (this._vault.getVaultKey() ?? undefined) : undefined;
          const meta = await this._blob.upload(item.file, this.namespace(), {
            encryptWith: key,
            onProgress: (p) => this._setProgress(item.localId, p.pct),
          });
          this._markDone(item.localId, meta);
          added.push(meta);
        } catch (err) {
          this._markError(item.localId, this._humanize(err));
        }
      }

      if (added.length > 0) {
        this._toast.success(`${added.length} archivo(s) subido(s)`);
        this.added.emit(added);
      }

      const remaining = this._items().filter((i) => i.status === 'pending');
      if (remaining.length === 0) {
        this.isOpen.set(false);
      }
    };

    if (this.encrypt() && !this._vault.isUnlocked()) {
      this._vault.showModal(() => void doUpload());
      return;
    }
    await doUpload();
  }

  protected async onClose(): Promise<void> {
    if (this._hasPending()) {
      const ok = await this._confirm.warning('Hay subidas en curso. ¿Cerrar y cancelarlas?');
      if (!ok) return;
    }
    this.isOpen.set(false);
    this.closed.emit();
  }

  protected isImage(item: AddFileItem): boolean {
    return IMAGE_PATTERN.test(item.file.type);
  }

  protected sizeOf(item: AddFileItem): string {
    const b = item.file.size;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  private _accept(files: File[]): void {
    const maxSize = this.maxSize();
    const accepted: AddFileItem[] = [];
    for (const file of files) {
      if (file.size > maxSize) {
        this._errorMsg.set(`"${file.name}" excede el tamaño máximo`);
        return;
      }
      accepted.push({
        localId: crypto.randomUUID(),
        file,
        previewUrl: IMAGE_PATTERN.test(file.type) ? URL.createObjectURL(file) : null,
        progress: 0,
        status: 'pending',
      });
    }
    this._items.update((arr) => [...arr, ...accepted]);
    this._errorMsg.set(null);
  }

  private _setProgress(localId: string, pct: number): void {
    this._items.update((arr) =>
      arr.map((i) => (i.localId === localId ? { ...i, progress: pct } : i)),
    );
  }

  private _markStatus(localId: string, status: AddFileItem['status']): void {
    this._items.update((arr) => arr.map((i) => (i.localId === localId ? { ...i, status } : i)));
  }

  private _markDone(localId: string, metadata: FileMetadataI & { id: string }): void {
    this._items.update((arr) =>
      arr.map((i) =>
        i.localId === localId ? { ...i, status: 'done', progress: 100, metadata } : i,
      ),
    );
  }

  private _markError(localId: string, error: string): void {
    this._items.update((arr) =>
      arr.map((i) => (i.localId === localId ? { ...i, status: 'error', error } : i)),
    );
  }

  private _humanize(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Error al subir el archivo';
  }
}
