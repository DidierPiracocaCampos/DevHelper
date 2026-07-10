import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VaultSecurity } from '../../../security/vault-security';
import { matchOtherValidator } from '../../../forms/validators/match.validator';
import { UiPinField, ErrorMessage } from '../../../forms/fields';
import { UiButton } from '../../../components/ui-button/button';
import { UiAlert } from '../../../components/ui-alert/ui-alert';

@Component({
  selector: 'vault-create-panel',
  imports: [ReactiveFormsModule, FormsModule, UiPinField, ErrorMessage, UiButton, UiAlert],
  templateUrl: './vault-create-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultCreatePanel {
  private _vault = inject(VaultSecurity);
  private _fb = inject(FormBuilder).nonNullable;

  protected readonly isWebAuthnSupported = this._vault.isWebAuthnSupported;

  protected readonly creatingPasskey = signal(false);
  protected readonly creatingPin = signal(false);
  protected readonly passkeyError = signal<string | undefined>(undefined);
  protected readonly pinError = signal<string | undefined>(undefined);
  protected readonly pinSuccess = signal(false);
  protected readonly passkeySuccess = signal(false);
  protected readonly checked = signal<'PASSKEY' | 'PIN'>('PASSKEY');

  protected readonly pinForm = this._fb.group({
    pin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    verifyPin: this._fb.control<string>('', [Validators.required, matchOtherValidator('pin')]),
  });

  constructor() {
    this.pinForm.controls.pin.valueChanges.subscribe(() => {
      this.pinForm.controls.verifyPin.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  protected async registerPasskey(): Promise<void> {
    this.creatingPasskey.set(true);
    this.passkeyError.set(undefined);
    try {
      const ok = await this._vault.createVaultWithPasskey();
      if (ok) {
        this.passkeySuccess.set(true);
      } else {
        this.passkeyError.set('No se pudo crear la bóveda con Passkey.');
      }
    } catch (err: unknown) {
      this.passkeyError.set((err as Error).message);
    } finally {
      this.creatingPasskey.set(false);
    }
  }

  protected async submitPin(): Promise<void> {
    if (this.pinForm.invalid) {
      this.pinForm.markAllAsDirty();
      return;
    }
    this.creatingPin.set(true);
    this.pinError.set(undefined);
    try {
      const ok = await this._vault.createVault('pin', this.pinForm.controls.pin.value);
      if (ok) {
        this.pinForm.reset();
        this.pinSuccess.set(true);
      } else {
        this.pinError.set('No se pudo crear la bóveda con PIN.');
      }
    } catch (err: unknown) {
      this.pinError.set((err as Error).message);
    } finally {
      this.creatingPin.set(false);
    }
  }
}
