import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'devhelper:pin-lockout';

interface PinLockoutState {
  attempts: number;
  lockUntil: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class PinLockoutService {
  private readonly _destroyRef = inject(DestroyRef);

  readonly MAX_PIN_ATTEMPTS = 3;
  readonly PIN_LOCKOUT_DURATION_MS = 5 * 60 * 1000;

  private _attempts = signal(0);
  private _lockUntil = signal<number | null>(null);
  private _remainingMs = signal(0);

  readonly attempts = this._attempts.asReadonly();
  readonly lockUntil = this._lockUntil.asReadonly();
  readonly remainingMs = this._remainingMs.asReadonly();

  private _intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this._loadFromStorage();
    this._registerCleanup();
    this._startCountdownEffect();
  }

  isLocked(): boolean {
    const lockUntil = this._lockUntil();
    if (lockUntil === null) return false;
    if (Date.now() > lockUntil) {
      this._reset();
      return false;
    }
    return true;
  }

  attemptsRemaining(): number {
    if (this.isLocked()) return 0;
    return this.MAX_PIN_ATTEMPTS - this._attempts();
  }

  record(success: boolean): void {
    if (success) {
      this._reset();
      return;
    }
    const next = this._attempts() + 1;
    this._attempts.set(next);
    if (next >= this.MAX_PIN_ATTEMPTS) {
      this._lockUntil.set(Date.now() + this.PIN_LOCKOUT_DURATION_MS);
      this._persist();
    }
  }

  private _reset(): void {
    this._attempts.set(0);
    this._lockUntil.set(null);
    this._remainingMs.set(0);
    this._persist();
  }

  private _tick(): void {
    const lockUntil = this._lockUntil();
    if (lockUntil === null) {
      this._stopCountdown();
      return;
    }
    const remaining = Math.max(0, lockUntil - Date.now());
    this._remainingMs.set(remaining);
    if (remaining <= 0) {
      this._reset();
      this._stopCountdown();
    }
  }

  private _startCountdownEffect(): void {
    effect(() => {
      const lockUntil = this._lockUntil();
      if (lockUntil === null) {
        this._stopCountdown();
        return;
      }
      if (this._intervalId !== null) return;
      this._tick();
      this._intervalId = setInterval(() => this._tick(), 1000);
    });
  }

  private _stopCountdown(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  private _registerCleanup(): void {
    this._destroyRef.onDestroy(() => this._stopCountdown());
  }

  private _loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return;
      const state = parsed as PinLockoutState;
      this._attempts.set(typeof state.attempts === 'number' ? state.attempts : 0);
      this._lockUntil.set(typeof state.lockUntil === 'number' ? state.lockUntil : null);
    } catch {
      // ignore corrupt data
    }
  }

  private _persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const state: PinLockoutState = {
        attempts: this._attempts(),
        lockUntil: this._lockUntil(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }
}
