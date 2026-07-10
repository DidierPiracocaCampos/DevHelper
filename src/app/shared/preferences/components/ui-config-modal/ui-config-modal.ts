import { ChangeDetectionStrategy, Component, effect, input, model, signal } from '@angular/core';
import { UiModal } from '../../../components/ui-modal/ui-modal';
import { NasaImageSection } from '../nasa-image-section/nasa-image-section';
import { AiSearcherSection } from '../ai-searcher-section/ai-searcher-section';
import { VaultSection } from '../vault-section/vault-section';

export interface ConfigSection {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'ui-config-modal',
  imports: [UiModal, NasaImageSection, AiSearcherSection, VaultSection],
  templateUrl: './ui-config-modal.html',
  styleUrl: './ui-config-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiConfigModal {
  isOpen = model<boolean>(false);
  initialSection = input<string>('vault');

  protected readonly activeSection = signal<string>('vault');

  protected readonly sections: ConfigSection[] = [
    { id: 'vault', label: 'Vault', icon: 'shield' },
    { id: 'nasa', label: 'Widget NASA', icon: 'image' },
    { id: 'ai', label: 'Buscador de IA', icon: 'search' },
  ];

  private _syncInitialSection = effect(() => {
    if (this.isOpen()) {
      this.activeSection.set(this.initialSection());
    }
  });

  protected select(id: string): void {
    this.activeSection.set(id);
    this._captureFocus();
  }

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
