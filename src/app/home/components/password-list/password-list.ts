import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  ],
  templateUrl: './password-list.html',
  styleUrl: './password-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordList {
  private _repo = inject(PasswordRepository);
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _vault = inject(VaultSecurity);
  private _confirmService = inject(ConfirmService);
  private _toastService = inject(ToastService);

  readonly collection = this._repo.getCollection();

  isFormModalOpen = signal(false);
  isViewModalOpen = signal(false);

  addStatus = signal<{ isEdit?: boolean; loanding: boolean }>({ loanding: false });

  viewStatus = signal<{ password?: PasswordI; decrypted: string; loading: boolean; error: string }>(
    { loading: false, error: '', decrypted: '' },
  );
  editPassword = signal<string | null>(null);

  async openAdd() {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.openAdd());
      return;
    }
    this.editPassword.set(null);
    this.addStatus.update((v) => {
      v.isEdit = false;
      return v;
    });
    this.isFormModalOpen.set(true);
  }

  async openEdit(item: PasswordI) {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.openEdit(item));
      return;
    }
    this.editPassword.set(item.password.cipher.length > 0 ? '****' : '');
    this.addStatus.update((v) => {
      v.isEdit = true;
      return v;
    });
    this._form.patchValue({ name: item.name, secure: item.secure });
    this.isFormModalOpen.set(true);
  }

  async viewPassword(item: PasswordI) {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.viewPassword(item));
      return;
    }
    const vaultKey = this._vault.getVaultKey()!;
    this.viewStatus.update((v) => {
      v.password = item;
      v.loading = true;
      v.error = '';
      return v;
    });
    this.isViewModalOpen.set(true);
    try {
      const decrypted = await this._repo.decryptPassword(item.password, vaultKey);
      this.viewStatus.update((v) => {
        v.decrypted = decrypted;
        v.loading = false;
        return v;
      });
    } catch (_err) {
      this.viewStatus.update((v) => {
        v.error = 'Error al desencriptar';
        v.loading = false;
        return v;
      });
    }
  }

  async copyPassword(item: PasswordI) {
    if (!this._vault.isUnlocked()) {
      this._vault.showModal(() => this.copyPassword(item));
      return;
    }
    const vaultKey = this._vault.getVaultKey()!;
    try {
      const decrypted = await this._repo.decryptPassword(item.password, vaultKey);
      await navigator.clipboard.writeText(decrypted);
      this._toastService.success('Contraseña copiada');
    } catch (_err) {
      this._toastService.error('Error al copiar contraseña');
    }
  }

  cancelForm() {
    this.isFormModalOpen.set(false);
    this.addStatus.set({ loanding: false });
    this._form.reset();
    this.editPassword.set(null);
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
    this.addStatus.update((v) => {
      v.loanding = true;
      return v;
    });
    this._repo.addDoc({ name, password: encryptedPassword, secure: secure ?? false }).subscribe({
      next: () => {
        this.isFormModalOpen.set(false);
        this.collection.reload();
        this._form.reset();
        this.editPassword.set(null);
        this.addStatus.set({ loanding: false });
      },
      error: () => {
        this.addStatus.update((v) => {
          v.loanding = false;
          return v;
        });
      },
    });
  }

  async deletePassword(item: PasswordI) {
    const confirmed = await this._confirmService.delete(
      `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    if (!item.id) return;
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
