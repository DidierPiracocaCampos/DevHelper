import { ChangeDetectionStrategy, Component, effect, ElementRef, input, model, viewChild } from '@angular/core';

export type UiModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-modal',
  imports: [],
  templateUrl: './ui-modal.html',
  styleUrl: './ui-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiModal {
  title = input.required<string>();
  icon = input<string>('');
  size = input<UiModalSize>('md');
  showCloseButton = input<boolean>(true);
  closeOnEscape = input<boolean>(true);
  closeOnBackdrop = input<boolean>(true);
  static = input<boolean>(false);
  isOpen = model<boolean>(false);

  private _dialog = viewChild<ElementRef<HTMLDialogElement>>('dialogElement');

  private _syncDialogWithModel = effect(() => {
    const dialog = this._dialog()?.nativeElement;
    if (!dialog) return;

    if (this.isOpen()) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  });

  private _dialogCloseListener = effect(() => {
    const dialog = this._dialog()?.nativeElement;
    if (!dialog) return;

    const handleClose = () => {
      this.isOpen.set(false);
    };

    dialog.addEventListener('close', handleClose);

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  });

  private _preventCancelEffect = effect(() => {
    const dialog = this._dialog()?.nativeElement;
    if (!dialog) return;

    if (this.static() || !this.closeOnEscape()) {
      const handleCancel = (e: Event) => {
        e.preventDefault();
      };
      dialog.addEventListener('cancel', handleCancel);
      return () => dialog.removeEventListener('cancel', handleCancel);
    }

    return;
  });

  protected _onBackdropClick(event: MouseEvent) {
    if (!this.closeOnBackdrop() || this.static()) {
      event.preventDefault();
      return;
    }

    const dialog = this._dialog()?.nativeElement;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isBackdropClick =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (isBackdropClick) {
      this.isOpen.set(false);
    }
  }
}