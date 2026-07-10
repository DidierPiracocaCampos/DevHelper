import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Authenticator } from '../../service/authenticator';

@Injectable({ providedIn: 'root' })
export class SearchPaletteService {
  private readonly _auth = inject(Authenticator);
  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  constructor() {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (!this._auth.user()) return;
        e.preventDefault();
        this.toggle();
      }
    };
    document.addEventListener('keydown', handler);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', handler));
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  toggle(): void {
    this._isOpen.update((v) => !v);
  }
}
