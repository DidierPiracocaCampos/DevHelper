import { Injectable, signal, computed } from '@angular/core';

export type ToastSeverity = 'error' | 'success' | 'warning' | 'info';

export interface ToastI {
  id: string;
  message: string;
  severity: ToastSeverity;
  details?: string;
  expanded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastI[]>([]);
  readonly toasts = this._toasts.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);
  private readonly MAX_TOASTS = 5;
  private counter = 0;

  show(message: string, severity: ToastSeverity = 'error', details?: string, duration = 5000): void {
    const id = `toast-${++this.counter}`;
    const toast: ToastI = { id, message, severity, details, expanded: false };

    this._toasts.update(toasts => {
      const updated = [...toasts, toast];
      return updated.length > this.MAX_TOASTS ? updated.slice(-this.MAX_TOASTS) : updated;
    });

    setTimeout(() => this.dismiss(id), duration);
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
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  toggleExpanded(id: string): void {
    this._toasts.update(toasts =>
      toasts.map(t => (t.id === id ? { ...t, expanded: !t.expanded } : t))
    );
  }
}
