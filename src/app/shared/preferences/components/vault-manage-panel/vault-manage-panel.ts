import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VaultSecurity } from '../../../security/vault-security';
import { matchOtherValidator } from '../../../forms/validators/match.validator';
import { UiPinField, ErrorMessage } from '../../../forms/fields';
import { UiButton } from '../../../components/ui-button/button';
import { UiAlert } from '../../../components/ui-alert/ui-alert';

@Component({
  selector: 'vault-manage-panel',
  imports: [ReactiveFormsModule, UiPinField, ErrorMessage, UiButton, UiAlert],
  templateUrl: './vault-manage-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultManagePanel {
  private _vault = inject(VaultSecurity);
  private _fb = inject(FormBuilder).nonNullable;

  protected readonly havePin = this._vault.haveUnlockKeyWithPin;
  protected readonly havePasskey = this._vault.haveUnlockKeyWithPasskey;

  protected readonly isChangingPin = signal(false);
  protected readonly pinError = signal<string | undefined>(undefined);
  protected readonly pinChanged = signal(false);

  protected readonly changePinForm = this._fb.group({
    currentPin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    newPin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    confirmPin: this._fb.control<string>('', [Validators.required, matchOtherValidator('newPin')]),
  });

  constructor() {
    this.changePinForm.controls.newPin.valueChanges.subscribe(() => {
      this.changePinForm.controls.confirmPin.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  protected async submitChangePin(): Promise<void> {
    if (this.changePinForm.invalid) {
      this.changePinForm.markAllAsDirty();
      return;
    }
    this.isChangingPin.set(true);
    this.pinError.set(undefined);
    this.pinChanged.set(false);
    try {
      const ok = await this._vault.changePin(
        this.changePinForm.controls.currentPin.value,
        this.changePinForm.controls.newPin.value,
      );
      if (ok) {
        this.changePinForm.reset();
        this.pinChanged.set(true);
      } else {
        this.pinError.set('No se pudo cambiar el PIN. Verifica el PIN actual.');
      }
    } catch (err: unknown) {
      this.pinError.set((err as Error).message);
    } finally {
      this.isChangingPin.set(false);
    }
  }

  protected lockVault(): void {
    this._vault.lockVault();
  }
}
