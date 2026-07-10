import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VaultModalState {
  private _isUnlockOpen = signal(false);
  private _pendingAction = signal<(() => void) | null>(null);

  readonly isUnlockOpen = this._isUnlockOpen.asReadonly();

  openUnlock(action?: () => void): void {
    this._pendingAction.set(action ?? null);
    this._isUnlockOpen.set(true);
  }

  closeUnlock(): void {
    this._isUnlockOpen.set(false);
    this._pendingAction.set(null);
  }

  consumePendingAction(): (() => void) | null {
    const action = this._pendingAction();
    this._pendingAction.set(null);
    return action;
  }

  clearPendingIfNotOpen(): void {
    if (!this._isUnlockOpen()) {
      this._pendingAction.set(null);
    }
  }
}
