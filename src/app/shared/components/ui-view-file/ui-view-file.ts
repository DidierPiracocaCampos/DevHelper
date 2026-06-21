import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BlobNamespace, FileBlobService, FileMetadataI } from '../../files';
import { VaultSecurity } from '../../security';
import { ToastService } from '../../service/toast';
import { UiModal } from '../ui-modal/ui-modal';
import { UiButton } from '../ui-button/button';
import { UiAlert } from '../ui-alert/ui-alert';

const IMAGE_PATTERN = /^image\//;
const VIDEO_PATTERN = /^video\//;
const AUDIO_PATTERN = /^audio\//;
const PDF_PATTERN = /^application\/pdf$/;
const TEXT_PATTERN = /^text\//;

export type FileView = FileMetadataI & { id: string };

export type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'unsupported';

@Component({
  selector: 'ui-view-file',
  imports: [UiModal, UiButton, UiAlert],
  templateUrl: './ui-view-file.html',
  styleUrl: './ui-view-file.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiViewFile {
  private readonly _blob = inject(FileBlobService);
  private readonly _vault = inject(VaultSecurity);
  private readonly _toast = inject(ToastService);
  private readonly _sanitizer = inject(DomSanitizer);

  isOpen = model<boolean>(false);
  file = input.required<FileView | null>();
  namespace = input.required<BlobNamespace>();

  closed = output<void>();
  download = output<FileView>();

  protected readonly _blobUrl = signal<SafeUrl | null>(null);
  protected readonly _text = signal<string | null>(null);
  protected readonly _loading = signal(false);
  protected readonly _errorMsg = signal<string | null>(null);
  protected readonly _kind = signal<PreviewKind>('unsupported');

  constructor() {
    effect(() => {
      const f = this.file();
      const open = this.isOpen();
      if (!open || !f) {
        this._reset();
        return;
      }
      this._kind.set(this._detectKind(f.mimeType));
      if (f.encrypted && !this._vault.isUnlocked()) {
        this._vault.showModal(() => void this._load(f));
        return;
      }
      void this._load(f);
    });
  }

  protected previewUrl(): SafeUrl | null {
    return this._blobUrl();
  }

  protected textPreview(): string | null {
    return this._text();
  }

  protected kind(): PreviewKind {
    return this._kind();
  }

  protected loading(): boolean {
    return this._loading();
  }

  protected errorMsg(): string | null {
    return this._errorMsg();
  }

  protected fileValue(): FileView | null {
    return this.file();
  }

  protected async onDownload(): Promise<void> {
    const f = this.file();
    if (!f) return;
    const doDownload = async (): Promise<void> => {
      try {
        const key = f.encrypted ? (this._vault.getVaultKey() ?? undefined) : undefined;
        const bytes = await this._blob.getBytes(this.namespace(), f.id, key);
        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;
        const blob = new Blob([buffer], { type: f.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.download.emit(f);
      } catch (err) {
        this._toast.error('No se pudo descargar', err instanceof Error ? err.message : '');
      }
    };
    if (f.encrypted && !this._vault.isUnlocked()) {
      this._vault.showModal(() => void doDownload());
      return;
    }
    await doDownload();
  }

  protected onClose(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  private async _load(f: FileView): Promise<void> {
    this._loading.set(true);
    this._errorMsg.set(null);
    this._blobUrl.set(null);
    this._text.set(null);
    try {
      const key = f.encrypted ? (this._vault.getVaultKey() ?? undefined) : undefined;
      const bytes = await this._blob.getBytes(this.namespace(), f.id, key);
      const buffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([buffer], { type: f.mimeType });
      const url = URL.createObjectURL(blob);
      this._blobUrl.set(this._sanitizer.bypassSecurityTrustUrl(url));
      if (this._kind() === 'text') {
        const text = await blob.text();
        this._text.set(text.slice(0, 200_000));
      }
    } catch (err) {
      this._errorMsg.set(err instanceof Error ? err.message : 'No se pudo cargar el archivo');
    } finally {
      this._loading.set(false);
    }
  }

  private _detectKind(mimeType: string): PreviewKind {
    if (IMAGE_PATTERN.test(mimeType)) return 'image';
    if (VIDEO_PATTERN.test(mimeType)) return 'video';
    if (AUDIO_PATTERN.test(mimeType)) return 'audio';
    if (PDF_PATTERN.test(mimeType)) return 'pdf';
    if (TEXT_PATTERN.test(mimeType) || mimeType === 'application/json') return 'text';
    return 'unsupported';
  }

  private _reset(): void {
    this._blobUrl.set(null);
    this._text.set(null);
    this._loading.set(false);
    this._errorMsg.set(null);
    this._kind.set('unsupported');
  }
}
