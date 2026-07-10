import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { UiModal } from '../ui-modal/ui-modal';
import { UiButton, UiButtonSeverity } from '../ui-button/button';
import { ConfirmService } from '../../service/confirm.service';

@Component({
  selector: 'confirm-modal',
  imports: [UiModal, UiButton],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModal {
  protected readonly _confirmService = inject(ConfirmService);
  protected readonly _isOpen = signal(false);
  protected readonly _isHiding = signal(false);
  protected readonly _typedValue = signal('');

  protected readonly _severityClass: Record<string, UiButtonSeverity> = {
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  protected readonly _severityBg: Record<string, string> = {
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  protected readonly _defaultIcon: Record<string, string> = {
    error: 'block',
    warning: 'warning',
    info: 'info',
  };

  protected readonly _hasConfirmPhrase = () => !!this._confirmService.config()?.confirmPhrase;
  protected readonly _canConfirm = () =>
    !this._hasConfirmPhrase() ||
    this._typedValue() === this._confirmService.config()?.confirmPhrase;

  constructor() {
    effect(() => {
      this._isOpen.set(this._confirmService.isOpen());
      if (this._confirmService.isOpen()) {
        this._typedValue.set('');
      }
    });

    effect(() => {
      if (!this._isOpen() && !this._confirmService.isOpen()) {
        setTimeout(() => {
          this._confirmService.clearConfig();
          this._isHiding.set(false);
          this._typedValue.set('');
        }, 300);
      }
    });
  }

  onConfirm(): void {
    if (!this._canConfirm()) return;
    this._isHiding.set(true);
    this._confirmService.resolve(true);
  }

  onCancel(): void {
    this._isHiding.set(true);
    this._confirmService.resolve(false);
  }

  onTypedInput(value: string): void {
    this._typedValue.set(value);
  }
}
