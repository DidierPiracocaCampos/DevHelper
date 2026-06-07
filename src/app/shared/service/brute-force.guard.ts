import { Injectable } from '@angular/core';

export interface FailedAttempt {
  timestamp: number;
  email: string;
}

const STORAGE_KEY = 'devhelper:brute-force-attempts';
const MAX_ENTRIES = 100;
const TRIM_TO = 50;

@Injectable({
  providedIn: 'root',
})
export class BruteForceGuard {
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly FAILED_ATTEMPTS_WINDOW_MS = 5 * 60 * 1000;

  private _attempts: FailedAttempt[] = this._loadFromStorage();

  isAccountLocked(email: string): boolean {
    const now = Date.now();
    const recent = this._getRecentAttempts(email, now);
    if (recent.length < this.MAX_FAILED_ATTEMPTS) {
      return false;
    }
    const oldest = recent[0];
    return now - oldest.timestamp < this.LOCKOUT_DURATION_MS;
  }

  recordFailedAttempt(email: string): void {
    this._attempts.push({ timestamp: Date.now(), email });
    if (this._attempts.length > MAX_ENTRIES) {
      this._attempts = this._attempts.slice(-TRIM_TO);
    }
    this._persist();
  }

  clearFailedAttempts(email: string): void {
    const target = email.toLowerCase();
    this._attempts = this._attempts.filter((a) => a.email.toLowerCase() !== target);
    this._persist();
  }

  private _getRecentAttempts(email: string, now: number): FailedAttempt[] {
    const target = email.toLowerCase();
    const cutoff = now - this.FAILED_ATTEMPTS_WINDOW_MS;
    return this._attempts
      .filter((a) => a.email.toLowerCase() === target && a.timestamp > cutoff)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  private _loadFromStorage(): FailedAttempt[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item: unknown): item is FailedAttempt =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as FailedAttempt).timestamp === 'number' &&
          typeof (item as FailedAttempt).email === 'string',
      );
    } catch {
      return [];
    }
  }

  private _persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._attempts));
    } catch {
      // storage may be full or disabled — silently ignore
    }
  }
}
