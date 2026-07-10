import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SearchPaletteService } from '../../../shared/search/services/search-palette.service';

const isMac =
  typeof navigator !== 'undefined' &&
  /\b(Mac|iPhone|iPad|iPod)\b/.test(navigator.platform || navigator.userAgent);

@Component({
  selector: 'ai-assistant',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css',
})
export class AiAssistant {
  private readonly _palette = inject(SearchPaletteService);

  readonly shortcutHint = isMac ? '\u2318K' : 'Ctrl+K';

  readonly ariaLabel = computed(() => `Abrir buscador (${this.shortcutHint})`);

  open(): void {
    this._palette.open();
  }
}
