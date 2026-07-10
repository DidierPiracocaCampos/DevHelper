import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { matchOtherValidator } from '../../../forms/validators/match.validator';
import { ErrorMessage, UiPinField } from '../../../forms/fields';
import { UiButton } from '../../../components/ui-button/button';
import { UiAlert } from '../../../components/ui-alert/ui-alert';

export type VaultMethodTabsMode = 'create' | 'unlock' | 'manage';

@Component({
  selector: 'vault-method-tabs',
  imports: [ReactiveFormsModule, FormsModule, UiPinField, ErrorMessage, UiButton, UiAlert],
  templateUrl: './vault-method-tabs.html',
  styleUrl: './vault-method-tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultMethodTabs {
  mode = input.required<VaultMethodTabsMode>();

  havePin = input<boolean>(false);
  havePasskey = input<boolean>(false);
  isWebAuthnSupported = input<boolean>(true);
  errorMessage = input<string | undefined>();
  isLoading = input<boolean>(false);
  isRemoving = input<boolean>(false);
  isChangingPin = input<boolean>(false);
  attemptsRemaining = input<number>(3);
  countdown = input<string>('');
  isLockedOut = input<boolean>(false);

  submitPin = output<string>();
  registerPasskey = output<void>();
  unlockWithPasskey = output<void>();
  switchToPin = output<void>();

  addPasskey = output<void>();
  replacePasskey = output<void>();
  removePasskey = output<void>();
  addPin = output<string>();
  changePin = output<{ current: string; new: string }>();
  removePin = output<void>();

  protected readonly checked = signal<'PASSKEY' | 'PIN'>('PASSKEY');

  protected readonly onlyPin = computed(() => this.havePin() && !this.havePasskey());
  protected readonly onlyPasskey = computed(() => this.havePasskey() && !this.havePin());
  protected readonly bothAvailable = computed(() => this.havePin() && this.havePasskey());

  private _fb = inject(FormBuilder).nonNullable;
  private _autoSubmitted = false;

  protected readonly unlockPinForm = this._fb.group({
    pin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
  });

  protected readonly createPinForm = this._fb.group({
    pin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    verifyPin: this._fb.control<string>('', [Validators.required, matchOtherValidator('pin')]),
  });

  protected readonly addPinForm = this._fb.group({
    pin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    verifyPin: this._fb.control<string>('', [Validators.required, matchOtherValidator('pin')]),
  });

  protected readonly changePinForm = this._fb.group({
    currentPin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    newPin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
    confirmPin: this._fb.control<string>('', [Validators.required, matchOtherValidator('newPin')]),
  });

  constructor() {
    this.unlockPinForm.controls.pin.valueChanges.subscribe((val) => {
      if (this.mode() !== 'unlock') return;
      if (this._autoSubmitted || val.length !== 5 || this.isLockedOut()) return;
      this._autoSubmitted = true;
      queueMicrotask(() => this._emitUnlockPin());
    });

    this.createPinForm.controls.pin.valueChanges.subscribe(() => {
      this.createPinForm.controls.verifyPin.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });

    this.addPinForm.controls.pin.valueChanges.subscribe(() => {
      this.addPinForm.controls.verifyPin.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });

    this.changePinForm.controls.newPin.valueChanges.subscribe(() => {
      this.changePinForm.controls.confirmPin.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  protected onPasskeyPress(): void {
    if (this.mode() === 'create') {
      this.registerPasskey.emit();
    } else if (this.mode() === 'unlock') {
      this.unlockWithPasskey.emit();
    } else {
      if (this.havePasskey()) {
        this.replacePasskey.emit();
      } else {
        this.addPasskey.emit();
      }
    }
  }

  protected onCreatePinSubmit(): void {
    if (this.createPinForm.invalid) {
      this.createPinForm.markAllAsDirty();
      return;
    }
    this.submitPin.emit(this.createPinForm.controls.pin.value);
  }

  protected onAddPinSubmit(): void {
    if (this.addPinForm.invalid) {
      this.addPinForm.markAllAsDirty();
      return;
    }
    this.addPin.emit(this.addPinForm.controls.pin.value);
  }

  protected onChangePinSubmit(): void {
    if (this.changePinForm.invalid) {
      this.changePinForm.markAllAsDirty();
      return;
    }
    this.changePin.emit({
      current: this.changePinForm.controls.currentPin.value,
      new: this.changePinForm.controls.newPin.value,
    });
  }

  protected onUnlockPinSubmit(): void {
    if (this.unlockPinForm.invalid) return;
    this._emitUnlockPin();
  }

  private _emitUnlockPin(): void {
    this.submitPin.emit(this.unlockPinForm.controls.pin.value);
  }

  protected onSwitchToPin(): void {
    this.checked.set('PIN');
    this.switchToPin.emit();
  }

  resetUnlockPin(): void {
    this.unlockPinForm.controls.pin.reset();
    this._autoSubmitted = false;
  }

  resetChangePin(): void {
    this.changePinForm.reset();
  }

  resetAddPin(): void {
    this.addPinForm.reset();
  }
}
