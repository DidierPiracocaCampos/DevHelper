import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiListItem } from '../../../shared/components/item-list/item-list';
import { UiListButton } from '../../../shared/components/list-button/list-button';
import { UiTextField, UiPasswordField } from '../../../shared/forms/fields';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordI } from '../../domain/password.interface';
import { PasswordRepository } from '../../service/passwords.repository';
import { UiButton } from '../../../shared/components/ui-button/button';
import { ErrorMessage } from '../../../shared/forms/fields';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { VaultSecurity } from '../../../shared/security/vault-security';
import { UiAlert } from '../../../shared/components/ui-alert/ui-alert';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { UiTooltipComponent } from '../../../shared/components/tooltip';
import { ActiveFilters, FilterBar, FilterService } from '../../../shared/filter';
import { passwordFilterSchema } from '../../service/password-filter.schema';

interface AddStatus {
  isEdit?: boolean;
  loading: boolean;
}

interface ViewStatus {
  password?: PasswordI;
  decrypted: string;
  loading: boolean;
  error: string;
}

@Component({
  selector: 'password-list',
  imports: [
    UiCardButton,
    UiCard,
    UiListItem,
    UiListButton,
    UiTextField,
    UiPasswordField,
    ReactiveFormsModule,
    UiButton,
    ErrorMessage,
    UiAlert,
    UiModal,
    UiTooltipComponent,
    FilterBar,
  ],
  templateUrl: './password-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordList {
  private _repo = inject(PasswordRepository);
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _vault = inject(VaultSecurity);
  private _confirmService = inject(ConfirmService);
  private _toastService = inject(ToastService);
  private _filter = inject(FilterService);

  readonly filterSchema = passwordFilterSchema;
  readonly collection = this._repo.getFilteredCollection(this._filter.queryOptions);

  onFiltersApply(_filters: ActiveFilters): void {
    this.collection.reload();
  }

  onFiltersClear(): void {
    this.collection.reload();
  }

  readonly isFormModalOpen = signal(false);
  readonly isViewModalOpen = signal(false);
  readonly addStatus = signal<AddStatus>({ loading: false });
  readonly viewStatus = signal<ViewStatus>({ loading: false, error: '', decrypted: '' });
  readonly copyingId = signal<string | null>(null);

  async openAdd() {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.openAdd());
      return;
    }
    this.addStatus.set({ ...this.addStatus(), isEdit: false });
    this.isFormModalOpen.set(true);
  }

  async openEdit(item: PasswordI) {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.openEdit(item));
      return;
    }
    this.addStatus.set({ isEdit: true, loading: false });
    this._form.patchValue({ name: item.name, secure: item.secure });
    this.isFormModalOpen.set(true);
  }

  async viewPassword(item: PasswordI) {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.viewPassword(item));
      return;
    }
    const vaultKey = this._vault.getVaultKey();
    if (!vaultKey) return;
    this.viewStatus.set({ password: item, loading: true, error: '', decrypted: '' });
    this.isViewModalOpen.set(true);
    try {
      const decrypted = await this._repo.decryptPassword(item.password, vaultKey);
      this.viewStatus.update((v) => ({ ...v, decrypted, loading: false }));
    } catch (_err) {
      this.viewStatus.update((v) => ({ ...v, error: 'Error al desencriptar', loading: false }));
    }
  }

  async copyPassword(item: PasswordI) {
    if (this.copyingId() !== null) return;
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.copyPassword(item));
      return;
    }
    const vaultKey = this._vault.getVaultKey();
    if (!vaultKey) return;
    this.copyingId.set(item.id ?? null);
    try {
      const decrypted = await this._repo.decryptPassword(item.password, vaultKey);
      await navigator.clipboard.writeText(decrypted);
      this._toastService.success('Contraseña copiada');
    } catch (err) {
      console.error('Error copying password', err);
      this._toastService.error('Error al copiar contraseña');
    } finally {
      this.copyingId.set(null);
    }
  }

  cancelForm() {
    this.isFormModalOpen.set(false);
    this.addStatus.set({ loading: false });
    this._form.reset();
  }

  closeViewModal() {
    this.isViewModalOpen.set(false);
    this.viewStatus.set({ loading: false, error: '', decrypted: '' });
  }

  async add() {
    const f = this._form;
    if (f.invalid) {
      f.markAllAsDirty();
      return;
    }
    const vaultKey = this._vault.getVaultKey();
    if (!vaultKey) {
      this._vault.showModal(() => this.add());
      return;
    }
    const { name, password, secure } = f.value;
    if (!name || !password) return;
    const encryptedPassword = await this._repo.encryptPassword(password, vaultKey);
    this.addStatus.update((v) => ({ ...v, loading: true }));
    const now = Timestamp.now();
    this._repo
      .addDoc({
        name,
        password: encryptedPassword,
        secure: secure ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .subscribe({
        next: () => {
          this.isFormModalOpen.set(false);
          this.collection.reload();
          this._form.reset();
          this.addStatus.set({ loading: false });
        },
        error: () => {
          this.addStatus.update((v) => ({ ...v, loading: false }));
        },
      });
  }

  async deletePassword(item: PasswordI) {
    const confirmed = await this._confirmService.delete(
      `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed || !item.id) return;
    this._repo.deleteDoc(item.id).subscribe({
      next: () => {
        this.collection.reload();
      },
    });
  }

  protected _form = this._formBuilder.group({
    name: this._formBuilder.control<string>('', [Validators.required]),
    password: this._formBuilder.control<string>('', [Validators.required]),
    secure: this._formBuilder.control<boolean>(false),
  });
}
