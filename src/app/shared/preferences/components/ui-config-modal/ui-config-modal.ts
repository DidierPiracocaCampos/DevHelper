import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { UiModal } from '../../../components/ui-modal/ui-modal';

export interface ConfigSection {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'ui-config-modal',
  imports: [UiModal],
  templateUrl: './ui-config-modal.html',
  styleUrl: './ui-config-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiConfigModal {
  isOpen = model<boolean>(false);

  protected readonly sections: ConfigSection[] = [
    { id: 'nasa', label: 'Widget NASA', icon: 'image' },
    { id: 'ai-searcher', label: 'Buscador de IA', icon: 'search' },
  ];

  protected _onOpenChange(open: boolean): void {
    this.isOpen.set(open);
    if (!open) {
      queueMicrotask(() => this._restoreFocus());
    }
  }

  private _lastFocused: HTMLElement | null = null;

  protected _captureFocus(): void {
    this._lastFocused = (document.activeElement as HTMLElement | null) ?? null;
  }

  private _restoreFocus(): void {
    if (this._lastFocused && typeof this._lastFocused.focus === 'function') {
      this._lastFocused.focus();
    }
    this._lastFocused = null;
  }
}
