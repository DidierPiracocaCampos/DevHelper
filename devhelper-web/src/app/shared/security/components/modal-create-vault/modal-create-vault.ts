import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VaultSecurity } from '../../vault-security';
import { InputPin } from "../../../forms/components/input-pin/input-pin";
import { matchOtherValidator } from '../../../forms/validators/match.validator';
import { ErrorMessage } from '../../../forms/components/input-base/error-message';
import { Button } from "../../../components/ui-button/button";
import { UiAlert } from "../../../components/ui-alert/ui-alert";

@Component({
  selector: 'secure-create-vault',
  imports: [ReactiveFormsModule, FormsModule, InputPin, ErrorMessage, Button, UiAlert],
  templateUrl: './modal-create-vault.html',
  styleUrl: './modal-create-vault.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCreateVault implements OnInit {
  protected secureModal = viewChild.required<ElementRef<HTMLDialogElement>>('secureModal');
  private _vault = inject(VaultSecurity);
  private _fb = inject(FormBuilder).nonNullable;
  protected creatingUnlockWithPasskey = signal(false);
  protected isLoadingUnlockWithPin = signal(false);
  protected createUnlockWithPin = signal(false);
  protected createUnlockWithPasskey = signal(false);
  protected pinError = signal<string | undefined>(undefined);
  protected passkeyError = signal<string | undefined>(undefined);
  protected successType = signal<'passkey' | 'pin' | undefined>(undefined);
  private _modal = computed(() => this.secureModal().nativeElement);

  protected readonly status = this._vault.status;
  protected readonly haveUnlockKeyWithPin = this._vault.haveUnlockKeyWithPin;
  protected readonly haveUnlockKeyWithPasskey = this._vault.haveUnlockKeyWithPasskey;

  protected readonly checked = signal('PASSKEY')

  async ngOnInit() {
    this._vault.secureModal(this._modal);
    if (this.haveUnlockKeyWithPin()) {
      this._secureForm.controls.current_pin.enable();
    }
  }

  private _pinStateEffect = effect(() => {
    if (this.haveUnlockKeyWithPin()) {
      this._secureForm.controls.current_pin.enable();
    } else {
      this._secureForm.controls.current_pin.disable();
    }
  });

  private _modalListenerEffect = effect((onCleanup) => {

    const modal = this._modal();
    if (!modal) return;
    const handleClose = () => {
      this._secureForm.reset();
      this._secureForm.get('current_pin')?.markAsPristine();
      this._secureForm.get('current_pin')?.markAsUntouched();
      this._secureForm.updateValueAndValidity();
      this.createUnlockWithPin.set(false);
      this.createUnlockWithPasskey.set(false);
      this.pinError.set(undefined);
      this.passkeyError.set(undefined);
      this.checked.set('PASSKEY');
    };
    modal.addEventListener('close', handleClose);
    modal.addEventListener('cancel', handleClose);
    onCleanup(() => {
      modal.removeEventListener('close', handleClose);
      modal.removeEventListener('cancel', handleClose);

    });
  });

  async submitFormPin() {
    const f = this._secureForm;
    if (f.invalid) {
      f.markAllAsDirty();
      return
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
    } catch (error: any) {
      this.pinError.set(error.message);
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
    } catch (error: any) {
      this.passkeyError.set(error.message);
    } finally {
      this.creatingUnlockWithPasskey.set(false);
    }
  }

  protected _secureForm = this._fb.group({
    current_pin: this._fb.control<string>({ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\d{5}$/)]),
    pin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    verify_pin: this._fb.control<string>('', [Validators.required, matchOtherValidator('pin')]),
  });

}