import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { VaultSecurity } from '../../../security/vault-security';
import { VAULT_STATUS } from '../../../security/models/vault.model';
import { UiButton } from '../../../components/ui-button/button';
import { UiAlert } from '../../../components/ui-alert/ui-alert';
import { ConfirmService } from '../../../service/confirm.service';
import { ToastService } from '../../../service/toast';
import { VaultMethodTabs } from '../vault-method-tabs/vault-method-tabs';

const LAST_METHOD_PHRASE = 'ELIMINAR';

@Component({
  selector: 'vault-section',
  imports: [UiButton, UiAlert, VaultMethodTabs],
  templateUrl: './vault-section.html',
  styleUrl: './vault-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultSection {
  protected readonly VAULT_STATUS = VAULT_STATUS;

  private _vault = inject(VaultSecurity);
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);

  protected readonly status = computed(() => this._vault.vaultStatus());
  protected readonly havePin = this._vault.haveUnlockKeyWithPin;
  protected readonly havePasskey = this._vault.haveUnlockKeyWithPasskey;
  protected readonly isWebAuthnSupported = this._vault.isWebAuthnSupported;
  protected readonly isLockedOut = this._vault.isPinLockedOut;
  protected readonly attemptsRemaining = this._vault.pinAttemptsRemaining;
  protected readonly countdownMs = this._vault.pinLockoutRemainingMs;

  protected readonly countdown = computed(() => {
    const ms = this.countdownMs();
    if (ms <= 0) return '';
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  });

  private readonly _methodTabs = viewChild<VaultMethodTabs>('methodTabs');

  protected readonly isCreating = signal(false);
  protected readonly isUnlocking = signal(false);
  protected readonly isAddingPin = signal(false);
  protected readonly isAddingPasskey = signal(false);
  protected readonly isChangingPin = signal(false);
  protected readonly isRemoving = signal(false);
  protected readonly isReplacingPasskey = signal(false);

  protected readonly createError = signal<string | undefined>(undefined);
  protected readonly unlockError = signal<string | undefined>(undefined);
  protected readonly managementError = signal<string | undefined>(undefined);

  protected async onRegisterPasskey(): Promise<void> {
    this.isCreating.set(true);
    this.createError.set(undefined);
    try {
      const ok = await this._vault.createVault({ withPasskey: true });
      if (!ok) {
        this.createError.set('No se pudo crear el Vault con passkey.');
      }
    } catch (err: unknown) {
      this.createError.set((err as Error).message);
    } finally {
      this.isCreating.set(false);
    }
  }

  protected async onCreatePin(pin: string): Promise<void> {
    this.isCreating.set(true);
    this.createError.set(undefined);
    try {
      const ok = await this._vault.createVault({ pin });
      if (!ok) {
        this.createError.set('No se pudo crear el Vault con PIN.');
      }
    } catch (err: unknown) {
      this.createError.set((err as Error).message);
    } finally {
      this.isCreating.set(false);
    }
  }

  protected async onUnlockPin(pin: string): Promise<void> {
    if (this.isUnlocking() || this.isLockedOut()) return;
    this.isUnlocking.set(true);
    this.unlockError.set(undefined);
    try {
      await this._vault.unlockWithPin(pin);
    } catch (err: unknown) {
      this.unlockError.set((err as Error).message);
      this._methodTabs()?.resetUnlockPin();
    } finally {
      this.isUnlocking.set(false);
    }
  }

  protected async onUnlockPasskey(): Promise<void> {
    if (this.isUnlocking()) return;
    this.isUnlocking.set(true);
    this.unlockError.set(undefined);
    try {
      await this._vault.unlockWithPasskey();
    } catch (err: unknown) {
      this.unlockError.set((err as Error).message);
    } finally {
      this.isUnlocking.set(false);
    }
  }

  protected onSwitchToPin(): void {
    this.unlockError.set(undefined);
  }

  protected async onChangePin(data: { current: string; new: string }): Promise<void> {
    this.isChangingPin.set(true);
    this.managementError.set(undefined);
    try {
      const ok = await this._vault.changePin(data.current, data.new);
      if (ok) {
        this._methodTabs()?.resetChangePin();
        this._toast.success('PIN actualizado.');
      } else {
        this.managementError.set('No se pudo cambiar el PIN. Verifica tu PIN actual.');
      }
    } catch (err: unknown) {
      this.managementError.set((err as Error).message);
    } finally {
      this.isChangingPin.set(false);
    }
  }

  protected async onAddPin(pin: string): Promise<void> {
    this.isAddingPin.set(true);
    this.managementError.set(undefined);
    try {
      const ok = await this._vault.addPin(pin);
      if (ok) {
        this._methodTabs()?.resetAddPin();
        this._toast.success('PIN agregado.');
      } else {
        this.managementError.set('No se pudo agregar el PIN.');
      }
    } catch (err: unknown) {
      this.managementError.set((err as Error).message);
    } finally {
      this.isAddingPin.set(false);
    }
  }

  protected async onAddPasskey(): Promise<void> {
    if (this.isAddingPasskey()) return;
    this.isAddingPasskey.set(true);
    this.managementError.set(undefined);
    try {
      const ok = await this._vault.addPasskey();
      if (ok) {
        this._toast.success('Passkey agregado.');
      } else {
        this.managementError.set('No se pudo agregar el passkey.');
      }
    } finally {
      this.isAddingPasskey.set(false);
    }
  }

  protected async onRemovePin(): Promise<void> {
    if (this.isRemoving()) return;
    const isLast = !this.havePasskey();
    const confirmed = isLast
      ? await this._confirm.hardConfirm({
          title: 'Eliminar último método',
          message:
            'Vas a eliminar tu ÚNICO método de desbloqueo. Después de esto no podrás volver a entrar al vault y los datos encriptados serán irrecuperables.\n\nEsta acción no se puede deshacer.',
          confirmPhrase: LAST_METHOD_PHRASE,
          confirmLabel: 'Eliminar definitivamente',
        })
      : await this._confirm.warning(
          '¿Quitar el PIN? El passkey seguirá disponible para desbloquear el vault.',
          'Quitar PIN',
        );
    if (!confirmed) return;
    this.isRemoving.set(true);
    this.managementError.set(undefined);
    try {
      const ok = await this._vault.removePin();
      if (ok) {
        this._toast.success('PIN eliminado.');
      } else {
        this.managementError.set('No se pudo eliminar el PIN.');
      }
    } finally {
      this.isRemoving.set(false);
    }
  }

  protected async onRemovePasskey(): Promise<void> {
    if (this.isRemoving()) return;
    const isLast = !this.havePin();
    const confirmed = isLast
      ? await this._confirm.hardConfirm({
          title: 'Eliminar último método',
          message:
            'Vas a eliminar tu ÚNICO método de desbloqueo. Después de esto no podrás volver a entrar al vault y los datos encriptados serán irrecuperables.\n\nEsta acción no se puede deshacer.',
          confirmPhrase: LAST_METHOD_PHRASE,
          confirmLabel: 'Eliminar definitivamente',
        })
      : await this._confirm.warning(
          '¿Quitar el passkey? El PIN seguirá disponible para desbloquear el vault.',
          'Quitar passkey',
        );
    if (!confirmed) return;
    this.isRemoving.set(true);
    this.managementError.set(undefined);
    try {
      const ok = await this._vault.removePasskey();
      if (ok) {
        this._toast.success('Passkey eliminado.');
      } else {
        this.managementError.set('No se pudo eliminar el passkey.');
      }
    } finally {
      this.isRemoving.set(false);
    }
  }

  protected async onReplacePasskey(): Promise<void> {
    if (this.isReplacingPasskey()) return;
    const confirmed = await this._confirm.warning(
      'Vas a reemplazar el passkey actual. Tu dispositivo te pedirá registrar uno nuevo.',
      'Reemplazar passkey',
    );
    if (!confirmed) return;
    this.isReplacingPasskey.set(true);
    this.managementError.set(undefined);
    try {
      const ok = await this._vault.replacePasskey();
      if (ok) {
        this._toast.success('Passkey reemplazado.');
      } else {
        this.managementError.set('No se pudo reemplazar el passkey.');
      }
    } finally {
      this.isReplacingPasskey.set(false);
    }
  }

  protected lockVault(): void {
    this._vault.lockVault();
  }
}
