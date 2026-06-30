import { Injectable, signal, computed } from '@angular/core';

export type ToastSeverity = 'error' | 'success' | 'warning' | 'info';

export interface ToastI {
  id: string;
  message: string;
  severity: ToastSeverity;
  details?: string;
  expanded: boolean;
  closing: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastI[]>([]);
  readonly toasts = this._toasts.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);

  private readonly DEFAULT_DURATION_MS = 5000;
  private readonly FADE_OUT_MS = 150;
  private readonly MAX_TOASTS = 5;

  private counter = 0;
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(
    message: string,
    severity: ToastSeverity = 'error',
    details?: string,
    duration: number = this.DEFAULT_DURATION_MS,
  ): void {
    const id = `toast-${++this.counter}`;
    const toast: ToastI = {
      id,
      message,
      severity,
      details,
      expanded: false,
      closing: false,
    };

    this._toasts.update((toasts) => {
      const updated = [...toasts, toast];
      if (updated.length > this.MAX_TOASTS) {
        const evicted = updated.slice(0, updated.length - this.MAX_TOASTS);
        for (const t of evicted) {
          this.cancelTimer(t.id);
        }
        return updated.slice(-this.MAX_TOASTS);
      }
      return updated;
    });

    const handle = setTimeout(() => this.closeWithAnimation(id), duration);
    this.timers.set(id, handle);
  }

  error(message: string, details?: string): void {
    this.show(message, 'error', details);
  }

  success(message: string, details?: string): void {
    this.show(message, 'success', details);
  }

  warning(message: string, details?: string): void {
    this.show(message, 'warning', details);
  }

  info(message: string, details?: string): void {
    this.show(message, 'info', details);
  }

  dismiss(id: string): void {
    this.cancelTimer(id);
    this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  closeWithAnimation(id: string): void {
    this.cancelTimer(id);

    const exists = this._toasts().some((t) => t.id === id);
    if (!exists) {
      return;
    }

    this._toasts.update((toasts) => toasts.map((t) => (t.id === id ? { ...t, closing: true } : t)));

    const handle = setTimeout(() => {
      this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
    }, this.FADE_OUT_MS);
    this.timers.set(id, handle);
  }

  toggleExpanded(id: string): void {
    this._toasts.update((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t)),
    );
  }

  private cancelTimer(id: string): void {
    const handle = this.timers.get(id);
    if (handle !== undefined) {
      clearTimeout(handle);
      this.timers.delete(id);
    }
  }
}
