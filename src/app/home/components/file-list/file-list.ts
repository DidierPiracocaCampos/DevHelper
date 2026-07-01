import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FileBlobService,
  FileRepository,
  FILE_FILTER_SCHEMA,
  iconFor,
} from '../../../shared/files';
import { FileRow, FileView } from '../../../shared/components/file-components';
import { VaultSecurity } from '../../../shared/security/vault-security';
import { ActiveFilters, FilterBar, FilterService } from '../../../shared/filter';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { UiListItem } from '../../../shared/components/item-list/item-list';
import { UiListButton } from '../../../shared/components/list-button/list-button';
import { UiTooltipComponent } from '../../../shared/components/tooltip';
import { UiAddFile } from '../../../shared/components/ui-add-file/ui-add-file';
import { UiViewFile } from '../../../shared/components/ui-view-file/ui-view-file';

@Component({
  selector: 'file-list',
  imports: [
    UiCard,
    UiCardButton,
    UiListItem,
    UiListButton,
    UiTooltipComponent,
    FilterBar,
    UiAddFile,
    UiViewFile,
  ],
  providers: [FilterService],
  templateUrl: './file-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileList {
  private _repo = inject(FileRepository);
  private _vault = inject(VaultSecurity);
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _filter = inject(FilterService);
  private _blob = inject(FileBlobService);

  readonly filterSchema = FILE_FILTER_SCHEMA;
  readonly collection = this._repo.getFilteredCollection(this._filter.queryOptions);
  readonly namespace = this._repo.namespace;

  readonly isAddOpen = signal(false);
  readonly isViewOpen = signal(false);
  readonly viewFile = signal<FileView | null>(null);

  onFiltersApply(_filters: ActiveFilters): void {
    this.collection.reload();
  }

  onFiltersClear(): void {
    this.collection.reload();
  }

  openAdd(): void {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.openAdd());
      return;
    }
    this.isAddOpen.set(true);
  }

  onView(item: FileRow): void {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.onView(item));
      return;
    }
    this.viewFile.set(item);
    this.isViewOpen.set(true);
  }

  async onDownload(item: FileRow): Promise<void> {
    if (!item.id) return;
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => void this.onDownload(item));
      return;
    }
    try {
      const key = item.encrypted ? (this._vault.getVaultKey() ?? undefined) : undefined;
      const bytes = await this._blob.getBytes(this._repo.namespace(), item.id, key);
      const buffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;
      const blob = new Blob([buffer], { type: item.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      this._toast.error('No se pudo descargar', err instanceof Error ? err.message : '');
    }
  }

  async onRemove(item: FileRow): Promise<void> {
    const ok = await this._confirm.delete(
      `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`,
    );
    if (!ok || !item.id) return;
    this._repo.deleteDoc(item.id).subscribe({
      next: () => this.collection.reload(),
    });
  }

  onAdded(): void {
    this.collection.reload();
  }

  closeView(): void {
    this.isViewOpen.set(false);
    this.viewFile.set(null);
  }

  protected subLabel(file: FileRow): string {
    const size = this.formatSize(file.size);
    const mime = file.mimeType;
    const date = file.createdAt ? this.formatDate(file.createdAt) : '';
    return date ? `${size} · ${mime} · ${date}` : `${size} · ${mime}`;
  }

  protected iconFor(mime: string): string {
    return iconFor(mime);
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
}
