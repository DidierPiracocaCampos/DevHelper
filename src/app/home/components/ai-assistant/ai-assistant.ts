import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SearchPaletteService } from '../../../shared/search/services/search-palette.service';

@Component({
  selector: 'ai-assistant',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css',
})
export class AiAssistant {
  private readonly _palette = inject(SearchPaletteService);

  readonly shortcutHint = this.isMac ? '\u2318K' : 'Ctrl+K';

  readonly ariaLabel = computed(() => `Abrir buscador (${this.shortcutHint})`);

  open(): void {
    this._palette.open();
  }

  protected get isMac(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      /\b(Mac|iPhone|iPad|iPod)\b/.test(navigator.platform || navigator.userAgent)
    );
  }
}
