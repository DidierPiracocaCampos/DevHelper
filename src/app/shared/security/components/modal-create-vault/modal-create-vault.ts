import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VaultSecurity } from '../../vault-security';
import { UiModal } from '../../../components/ui-modal/ui-modal';
import { UiPinField, ErrorMessage } from '../../../forms/fields';
import { matchOtherValidator } from '../../../forms/validators/match.validator';
import { UiButton } from '../../../components/ui-button/button';
import { UiAlert } from '../../../components/ui-alert/ui-alert';

@Component({
  selector: 'secure-create-vault',
  imports: [ReactiveFormsModule, FormsModule, UiModal, UiPinField, ErrorMessage, UiButton, UiAlert],
  templateUrl: './modal-create-vault.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCreateVault {
  protected creatingUnlockWithPasskey = signal(false);
  protected isLoadingUnlockWithPin = signal(false);
  protected createUnlockWithPin = signal(false);
  protected createUnlockWithPasskey = signal(false);
  protected pinError = signal<string | undefined>(undefined);
  protected passkeyError = signal<string | undefined>(undefined);
  protected successType = signal<'passkey' | 'pin' | undefined>(undefined);
  protected checked = signal('PASSKEY');
  protected isOpen = signal(false);

  private _vault = inject(VaultSecurity);
  private _fb = inject(FormBuilder).nonNullable;

  protected readonly status = this._vault.vaultStatus;
  protected readonly haveUnlockKeyWithPin = this._vault.haveUnlockKeyWithPin;
  protected readonly haveUnlockKeyWithPasskey = this._vault.haveUnlockKeyWithPasskey;

  private _pinStateEffect = effect(() => {
    if (this.haveUnlockKeyWithPin()) {
      this._secureForm.controls.current_pin.enable();
    } else {
      this._secureForm.controls.current_pin.disable();
    }
  });

  private _syncOpenEffect = effect(() => {
    this.isOpen.set(this._vault.isSecureModalOpen());
  });

  constructor() {
    this._secureForm.controls.pin.valueChanges.subscribe(() => {
      this._secureForm.controls.verify_pin.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  protected onModalClose(): void {
    this._secureForm.reset();
    this._secureForm.get('current_pin')?.markAsPristine();
    this._secureForm.get('current_pin')?.markAsUntouched();
    this._secureForm.updateValueAndValidity();
    this.createUnlockWithPin.set(false);
    this.createUnlockWithPasskey.set(false);
    this.pinError.set(undefined);
    this.passkeyError.set(undefined);
    this.checked.set('PASSKEY');
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
    this._vault.closeCreateModal();
  }

  async submitFormPin() {
    const f = this._secureForm;
    if (f.invalid) {
      f.markAllAsDirty();
      return;
    }
    this.isLoadingUnlockWithPin.set(true);
    this.pinError.set(undefined);
    const value = f.value;
    try {
      let result: boolean;

      if (this.haveUnlockKeyWithPin()) {
        result = await this._vault.changePin(value.current_pin ?? '', value.pin ?? '');
      } else {
        result = await this._vault.createVault('pin', value.pin);
      }

      if (result) {
        this._secureForm.reset();
        this.createUnlockWithPin.set(true);
        this.successType.set('pin');
      }
    } catch (error: unknown) {
      this.pinError.set((error as Error).message);
    } finally {
      this.isLoadingUnlockWithPin.set(false);
    }
  }

  async registerPasskey() {
    this.creatingUnlockWithPasskey.set(true);
    this.passkeyError.set(undefined);

    try {
      const result = await this._vault.createVaultWithPasskey();

      if (result) {
        this.createUnlockWithPasskey.set(true);
        this.successType.set('passkey');
      } else {
        this.passkeyError.set('No se pudo crear el vault con passkey.');
      }
    } catch (error: unknown) {
      this.passkeyError.set((error as Error).message);
    } finally {
      this.creatingUnlockWithPasskey.set(false);
    }
  }

  protected _secureForm = this._fb.group({
    current_pin: this._fb.control<string>({ value: '', disabled: true }, [
      Validators.required,
      Validators.pattern(/^\d{5}$/),
    ]),
    pin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    verify_pin: this._fb.control<string>('', [Validators.required, matchOtherValidator('pin')]),
  });
}
