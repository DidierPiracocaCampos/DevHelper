import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { VaultModalState } from './vault-modal-state';

describe('VaultModalState', () => {
  let state: VaultModalState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(VaultModalState);
  });

  it('opens the unlock modal and stores a pending action', () => {
    const action = () => {};
    state.openUnlock(action);
    expect(state.isUnlockOpen()).toBe(true);
  });

  it('closes the unlock modal and clears the pending action', () => {
    const action = () => {};
    state.openUnlock(action);
    state.closeUnlock();
    expect(state.isUnlockOpen()).toBe(false);
  });

  it('opens again with a new action after closing', () => {
    const a1 = () => {};
    const a2 = () => {};
    state.openUnlock(a1);
    state.closeUnlock();
    state.openUnlock(a2);
    expect(state.isUnlockOpen()).toBe(true);
  });

  it('clearPendingIfNotOpen clears the pending action when modal is not open', () => {
    const action = () => {};
    state.openUnlock(action);
    state.closeUnlock();
    state.clearPendingIfNotOpen();
    const consumed = state.consumePendingAction();
    expect(consumed).toBeNull();
  });

  it('clearPendingIfNotOpen keeps the pending action when modal is open', () => {
    const action = () => {};
    state.openUnlock(action);
    state.clearPendingIfNotOpen();
    const consumed = state.consumePendingAction();
    expect(consumed).toBe(action);
  });

  it('consumePendingAction returns and clears the action', () => {
    const action = () => {};
    state.openUnlock(action);
    expect(state.consumePendingAction()).toBe(action);
    expect(state.consumePendingAction()).toBeNull();
  });
});
