import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VaultModalState {
  private _isCreateOpen = signal(false);
  private _isUnlockOpen = signal(false);
  private _pendingAction = signal<(() => void) | null>(null);

  readonly isCreateOpen = this._isCreateOpen.asReadonly();
  readonly isUnlockOpen = this._isUnlockOpen.asReadonly();

  openCreate(): void {
    this._isCreateOpen.set(true);
  }

  closeCreate(): void {
    this._isCreateOpen.set(false);
  }

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
