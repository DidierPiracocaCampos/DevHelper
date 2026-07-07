import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'ai-searcher-section',
  imports: [],
  templateUrl: './ai-searcher-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiSearcherSection {
  private _prefs = inject(PreferencesService);

  protected readonly enabled = this._prefs.aiSearcherEnabled;
  protected readonly isBusy = signal(false);

  protected async onToggle(event: Event): Promise<void> {
    const checked = (event.target as HTMLInputElement).checked;
    this.isBusy.set(true);
    try {
      await this._prefs.setAiSearcherEnabled(checked);
    } finally {
      this.isBusy.set(false);
    }
  }
}
