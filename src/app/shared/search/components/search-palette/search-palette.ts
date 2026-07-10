import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { UiModal } from '../../../components/ui-modal/ui-modal';
import { UiButton } from '../../../components/ui-button/button';
import { AiService } from '../../../../home/ai/ai.service';
import { VaultModalState } from '../../../security/services/vault-modal-state';
import { SearchPaletteService } from '../../services/search-palette.service';
import { IssueLocationService } from '../../services/issue-location.service';
import { SelectedProjectStore } from '../../../scope';
import {
  AiMatchedDoc,
  VaultLockedError,
  ModelNotReadyError,
} from '../../../../home/ai/ai-result.model';

type PaletteError = 'vault' | 'model' | 'unknown' | null;

const DEBOUNCE_MS = 250;
const isMac =
  typeof navigator !== 'undefined' &&
  /\b(Mac|iPhone|iPad|iPod)\b/.test(navigator.platform || navigator.userAgent);

const COL_ICON: Record<AiMatchedDoc['collection'], string> = {
  proyectos: 'folder',
  issues: 'task_alt',
  passwords: 'lock',
};

@Component({
  selector: 'search-palette',
  imports: [DecimalPipe, UiModal, UiButton],
  templateUrl: './search-palette.html',
  styleUrl: './search-palette.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPalette implements OnDestroy {
  private readonly _palette = inject(SearchPaletteService);
  private readonly _ai = inject(AiService);
  private readonly _vaultModal = inject(VaultModalState);
  private readonly _issueLocation = inject(IssueLocationService);
  private readonly _selected = inject(SelectedProjectStore);

  readonly status = this._ai.status;
  readonly isProcessing = this._ai.isProcessing;
  readonly shortcutHint = isMac ? '\u2318K' : 'Ctrl+K';
  readonly colIcon = COL_ICON;

  readonly localIsOpen = signal(false);
  readonly query = signal('');
  readonly result = signal<AiMatchedDoc[]>([]);
  readonly selectedIdx = signal(0);
  readonly error = signal<PaletteError>(null);

  private readonly _inputRef = viewChild<ElementRef<HTMLInputElement>>('queryInput');
  private readonly _listRef = viewChild<ElementRef<HTMLElement>>('resultList');
  private _pendingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.localIsOpen.set(this._palette.isOpen());
    });

    effect(() => {
      const open = this._palette.isOpen();
      if (open) {
        this.query.set('');
        this.result.set([]);
        this.error.set(null);
        this.selectedIdx.set(0);
        queueMicrotask(() => this._inputRef()?.nativeElement.focus());
      }
    });

    effect(() => {
      const q = this.query().trim();
      if (!this._palette.isOpen()) return;
      if (this._pendingTimer) clearTimeout(this._pendingTimer);
      if (!q) {
        this.result.set([]);
        this.error.set(null);
        this.selectedIdx.set(0);
        return;
      }
      this._pendingTimer = setTimeout(() => this.runQuery(q), DEBOUNCE_MS);
    });
  }

  ngOnDestroy(): void {
    if (this._pendingTimer) clearTimeout(this._pendingTimer);
  }

  onModalClosed(): void {
    this._palette.close();
  }

  trackById = (_: number, m: AiMatchedDoc): string => `${m.collection}:${m.id}`;

  private async runQuery(q: string): Promise<void> {
    this.selectedIdx.set(0);
    try {
      if (this._ai.status() !== 'ready') throw new ModelNotReadyError();
      const res = await this._ai.query(q);
      this.result.set(res.matched);
      this.error.set(null);
    } catch (err) {
      if (err instanceof VaultLockedError) {
        this.error.set('vault');
      } else if (err instanceof ModelNotReadyError) {
        this.error.set('model');
      } else {
        this.error.set('unknown');
      }
      this.result.set([]);
    }
  }

  onArrowDown(e: KeyboardEvent): void {
    e.preventDefault();
    const items = this.result();
    if (items.length === 0) return;
    this.selectedIdx.update((i) => Math.min(i + 1, items.length - 1));
    this.scrollSelectedIntoView();
  }

  onArrowUp(e: KeyboardEvent): void {
    e.preventDefault();
    const items = this.result();
    if (items.length === 0) return;
    this.selectedIdx.update((i) => Math.max(i - 1, 0));
    this.scrollSelectedIntoView();
  }

  async onEnter(e: KeyboardEvent): Promise<void> {
    e.preventDefault();
    const items = this.result();
    const idx = this.selectedIdx();
    if (idx < 0 || idx >= items.length) return;
    await this.activateMatch(items[idx]);
  }

  onResultClick(match: AiMatchedDoc): void {
    void this.activateMatch(match);
  }

  private async activateMatch(match: AiMatchedDoc): Promise<void> {
    if (match.collection === 'proyectos') {
      this._selected.set(match.id);
      this._palette.close();
      return;
    }
    if (match.collection === 'issues') {
      const projectId = await this._issueLocation.findProjectIdByIssue(match.id);
      if (!projectId) return;
      this._palette.close();
      window.open(`/proyect/${projectId}/issues/${match.id}`, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  unlockVault(): void {
    this._vaultModal.openUnlock();
  }

  async enableModel(): Promise<void> {
    try {
      await this._ai.enable();
      const q = this.query().trim();
      if (q) await this.runQuery(q);
    } catch (err) {
      console.error('[SearchPalette] enable failed', err);
    }
  }

  private scrollSelectedIntoView(): void {
    queueMicrotask(() => {
      const list = this._listRef()?.nativeElement;
      if (!list) return;
      const sel = list.querySelector('[data-selected="true"]') as HTMLElement | null;
      sel?.scrollIntoView?.({ block: 'nearest' });
    });
  }
}
