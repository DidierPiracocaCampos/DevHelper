import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { BlobNamespace, FileBlobService, FileMetadataI } from '../../files';
import { VaultSecurity } from '../../security';
import { UiListButton } from '../list-button/list-button';
import { UiTooltipComponent } from '../tooltip';
import { makeThumbnail } from '../../files/utils/thumbnail';

const IMAGE_PATTERN = /^image\//;

export interface FileRow extends FileMetadataI {
  id: string;
}

export type FileRowList = (FileMetadataI & { id: string })[] | undefined;

@Component({
  selector: 'ui-file-list',
  imports: [UiListButton, UiTooltipComponent],
  templateUrl: './ui-file-list.html',
  styleUrl: './ui-file-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFileList {
  private readonly _blob = inject(FileBlobService);
  private readonly _vault = inject(VaultSecurity);

  files = input.required<FileRowList>();
  loading = input<boolean>(false);
  error = input<unknown | null>(null);
  scopeLabel = input<string>('');
  namespace = input.required<BlobNamespace>();

  view = output<FileRow>();
  download = output<FileRow>();
  remove = output<FileRow>();

  protected readonly _items = computed<FileRow[]>(() => this.files() ?? []);
  protected readonly _thumbs = new Map<string, string>();

  protected thumb(id: string): string | null {
    return this._thumbs.get(id) ?? null;
  }

  protected isImage(mimeType: string): boolean {
    return IMAGE_PATTERN.test(mimeType);
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  protected formatDate(ms: number): string {
    if (!ms) return '';
    return new Date(ms).toLocaleDateString();
  }

  protected onView(item: FileRow): void {
    this.view.emit(item);
  }

  protected onDownload(item: FileRow): void {
    this.download.emit(item);
  }

  protected onRemove(item: FileRow): void {
    this.remove.emit(item);
  }

  protected trackById = (_: number, item: FileRow): string => item.id;

  private readonly _loadThumbs = effect(() => {
    const arr = this._items();
    const ns = this.namespace();
    for (const f of arr) {
      if (this._thumbs.has(f.id)) continue;
      if (!this.isImage(f.mimeType)) continue;
      void this._loadThumb(f, ns);
    }
  });

  private async _loadThumb(f: FileRow, ns: BlobNamespace): Promise<void> {
    try {
      const key = f.encrypted ? this._vault.getVaultKey() : undefined;
      const bytes = await this._blob.getBytes(ns, f.id, key);
      const url = await makeThumbnail(bytes, f.mimeType);
      if (url) this._thumbs.set(f.id, url);
    } catch {
      // ignore thumbnail errors
    }
  }
}
