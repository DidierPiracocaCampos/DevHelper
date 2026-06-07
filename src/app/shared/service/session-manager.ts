import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState } from '@angular/fire/auth';
import { runInInjectionContext, Injector } from '@angular/core';

const STORAGE_KEY = 'devhelper:last-activity';
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'visibilitychange'] as const;

@Injectable({
  providedIn: 'root',
})
export class SessionManager {
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  private readonly _auth = inject(Auth);
  private readonly _injector = inject(Injector);

  private _lastActivity = signal<number>(this._loadInitialTimestamp());
  readonly lastActivity = this._lastActivity.asReadonly();

  private _isLoggedIn = toSignal(
    runInInjectionContext(this._injector, () => authState(this._auth)),
    { initialValue: null },
  );

  readonly isExpired = computed(() => {
    if (!this._isLoggedIn()) return false;
    return Date.now() - this._lastActivity() > this.SESSION_TIMEOUT_MS;
  });

  private _activityHandler = () => this._lastActivity.set(Date.now());

  private _trackEffect = effect(() => {
    if (typeof window === 'undefined') return;
    if (this._isLoggedIn()) {
      ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, this._activityHandler));
      window.addEventListener('storage', this._storageHandler);
    } else {
      this._detach();
    }
  });

  private _storageHandler = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const value = event.newValue ? Number(event.newValue) : Date.now();
    if (!Number.isNaN(value)) {
      this._lastActivity.set(value);
    }
  };

  private _detach(): void {
    if (typeof window === 'undefined') return;
    ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, this._activityHandler));
    window.removeEventListener('storage', this._storageHandler);
  }

  refresh(): void {
    this._lastActivity.set(Date.now());
    this._persist();
  }

  private _loadInitialTimestamp(): number {
    if (typeof localStorage === 'undefined') return Date.now();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return Date.now();
  }

  private _persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, String(this._lastActivity()));
    } catch {
      // silently ignore
    }
  }
}
