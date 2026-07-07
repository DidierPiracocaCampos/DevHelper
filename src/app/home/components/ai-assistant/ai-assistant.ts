import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiSearchField } from '../../../shared/forms/fields/ui-search-field/ui-search-field';
import { AiService } from '../../ai/ai.service';
import { PreferencesService } from '../../../shared/preferences/services/preferences.service';
import { VaultSecurity } from '../../../shared/security';
import { VaultModalState } from '../../../shared/security/services/vault-modal-state';

@Component({
  selector: 'ai-assistant',
  standalone: true,
  imports: [DecimalPipe, UiButton, UiSearchField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css',
})
export class AiAssistant {
  private readonly _ai = inject(AiService);
  private readonly _prefs = inject(PreferencesService);
  private readonly _vault = inject(VaultSecurity);
  private readonly _vaultModal = inject(VaultModalState);

  readonly status = this._ai.status;
  readonly downloadProgress = this._ai.downloadProgress;
  readonly isProcessing = this._ai.isProcessing;
  readonly lastResult = this._ai.lastResult;
  readonly enabled = this._prefs.aiAssistantEnabled;
  readonly searcherEnabled = this._prefs.aiSearcherEnabled;
  readonly vaultUnlocked = this._vault.isUnlocked;

  readonly progressPct = computed(() => {
    const p = this.downloadProgress();
    if (!p || p.total === 0) return 0;
    return Math.round((p.loaded / p.total) * 100);
  });

  async enable(): Promise<void> {
    try {
      await this._ai.enable();
      await this._prefs.setAiAssistantEnabled(true);
      await this._prefs.setAiSearcherEnabled(true);
    } catch (err) {
      console.error('AI assistant enable failed', err);
    }
  }

  async disable(): Promise<void> {
    this._ai.disable();
    await this._prefs.setAiAssistantEnabled(false);
  }

  openVaultUnlock(): void {
    this._vaultModal.openUnlock();
  }

  async ask(text: unknown): Promise<void> {
    if (typeof text !== 'string') return;
    const q = text.trim();
    if (!q) return;
    try {
      if (this._ai.status() !== 'ready') {
        await this._ai.enable();
      }
      await this._ai.query(q);
    } catch (err) {
      console.error('AI query failed', err);
    }
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
