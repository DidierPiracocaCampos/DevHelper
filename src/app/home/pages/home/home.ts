import { Component, computed, inject, signal } from '@angular/core';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { NasaPicture } from '../../components/nasa-picture/nasa-picture';
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from '../../components/password-list/password-list';
import { Loader } from '../../../shared/service/loader';
import { ModalCreateVault, ModalUnlockVault, VaultSecurity } from '../../../shared/security';
import { NasaImageSection, UiConfigModal } from '../../../shared/preferences';
import { ConfirmService } from '../../../shared/service/confirm.service';
import {
  BlobNamespace,
  FileRepository,
  FileMetadataI,
} from '../../../shared/files';
import { ScopeContext } from '../../../shared/scope/scope-context';
import {
  FileRow,
  FileView,
  UiFileList,
  UiAddFile,
  UiViewFile,
} from '../../../shared/components/file-components';

type FileItem = FileMetadataI & { id: string };

@Component({
  selector: 'app-home',
  imports: [
    UiCard,
    UiCardButton,
    NasaPicture,
    PasswordList,
    ModalCreateVault,
    ModalUnlockVault,
    UiConfigModal,
    NasaImageSection,
    UiFileList,
    UiAddFile,
    UiViewFile,
  ],
  templateUrl: './home.html',
})
export default class Home {
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _vault = inject(VaultSecurity);
  private _repo = inject(FileRepository);
  private _scope = inject(ScopeContext);
  private _confirm = inject(ConfirmService);

  protected readonly isConfigOpen = signal(false);
  protected readonly isAddOpen = signal(false);
  protected readonly isViewOpen = signal(false);
  protected readonly viewFile = signal<FileView | null>(null);

  protected readonly fileCollection = this._repo.getCollection();
  protected readonly fileList = computed<FileItem[]>(
    () => (this.fileCollection.value() as FileItem[] | undefined) ?? [],
  );
  protected readonly fileLoading = computed(() => this.fileCollection.isLoading());
  protected readonly fileError = computed(() => this.fileCollection.error());

  protected readonly namespace = computed<BlobNamespace>(() => this._repo.namespace());

  async ngOnInit() {
    this._scope.setGlobal();
    this._loader.hide();
  }

  logout() {
    this._authenticator.logout();
  }

  openVault() {
    this._vault.openUnlockVaultModal();
  }

  openConfig() {
    this.isConfigOpen.set(true);
  }

  openAdd() {
    this.isAddOpen.set(true);
  }

  onView(item: FileRow): void {
    this.viewFile.set(item);
    this.isViewOpen.set(true);
  }

  async onRemove(item: FileRow): Promise<void> {
    if (!item.id) return;
    const ok = await this._confirm.delete(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this._repo.deleteDoc(item.id).subscribe({
      next: () => this.fileCollection.reload(),
      error: () => this.fileCollection.reload(),
    });
  }

  onAdded(): void {
    this.fileCollection.reload();
  }
}
