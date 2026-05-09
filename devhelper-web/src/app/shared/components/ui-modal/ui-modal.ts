import { ChangeDetectionStrategy, Component, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';

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

  closed = output<void>();

  isOpen = signal(false);

  private _dialog = viewChild<ElementRef<HTMLDialogElement>>('dialogElement');

  open() {
    const dialog = this._dialog()?.nativeElement;
    if (!dialog) return;

    dialog.showModal();
    this.isOpen.set(true);
  }

  close() {
    const dialog = this._dialog()?.nativeElement;
    if (!dialog) return;

    dialog.close();
    this.isOpen.set(false);
    this.closed.emit();
  }

  private _backdropEffect = effect(() => {
    const dialog = this._dialog()?.nativeElement;
    if (!dialog) return;

    const handleClose = () => {
      this.isOpen.set(false);
      this.closed.emit();
    };

    dialog.addEventListener('close', handleClose);

    if (!this.closeOnEscape() && this.static()) {
      dialog.addEventListener('cancel', (e) => {
        e.preventDefault();
      });
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
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
      this.close();
    }
  }
}