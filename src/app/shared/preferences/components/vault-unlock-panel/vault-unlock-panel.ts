import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VaultSecurity } from '../../../security/vault-security';
import { UiPinField } from '../../../forms/fields';
import { UiButton } from '../../../components/ui-button/button';
import { UiAlert } from '../../../components/ui-alert/ui-alert';

@Component({
  selector: 'vault-unlock-panel',
  imports: [ReactiveFormsModule, FormsModule, UiPinField, UiButton, UiAlert],
  templateUrl: './vault-unlock-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultUnlockPanel {
  private _vault = inject(VaultSecurity);
  private _fb = inject(FormBuilder).nonNullable;
  private _autoSubmitted = false;

  protected readonly checked = signal<'PASSKEY' | 'PIN'>('PASSKEY');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | undefined>(undefined);

  protected readonly havePin = this._vault.haveUnlockKeyWithPin;
  protected readonly havePasskey = this._vault.haveUnlockKeyWithPasskey;
  protected readonly isLockedOut = this._vault.isPinLockedOut;
  protected readonly attemptsRemaining = this._vault.pinAttemptsRemaining;
  protected readonly countdownMs = this._vault.pinLockoutRemainingMs;

  protected readonly onlyPin = computed(() => this.havePin() && !this.havePasskey());
  protected readonly onlyPasskey = computed(() => this.havePasskey() && !this.havePin());
  protected readonly bothAvailable = computed(() => this.havePin() && this.havePasskey());

  protected readonly countdown = computed(() => {
    const ms = this.countdownMs();
    if (ms <= 0) return '';
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  });

  protected readonly pinForm = this._fb.group({
    pin: this._fb.control<string>('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
  });

  constructor() {
    this.pinForm.controls.pin.valueChanges.subscribe((val) => {
      if (!this._autoSubmitted && val.length === 5 && !this.isLockedOut()) {
        this._autoSubmitted = true;
        queueMicrotask(() => void this.submitPin());
      }
    });
  }

  protected switchToPin(): void {
    this.checked.set('PIN');
    this.errorMessage.set(undefined);
  }

  protected async submitPin(): Promise<void> {
    if (this.pinForm.invalid || this.isLoading() || this.isLockedOut()) return;
    this.isLoading.set(true);
    this.errorMessage.set(undefined);
    try {
      await this._vault.unlockWithPin(this.pinForm.controls.pin.value);
    } catch (err: unknown) {
      this.errorMessage.set((err as Error).message);
      this.pinForm.controls.pin.reset();
      this._autoSubmitted = false;
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async unlockWithPasskey(): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(undefined);
    try {
      await this._vault.unlockWithPasskey();
    } catch (err: unknown) {
      this.errorMessage.set((err as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
