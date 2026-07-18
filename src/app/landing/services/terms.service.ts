import { Injectable, computed, signal } from '@angular/core';
import { TERMS_LANG } from '../data/terms-version';

@Injectable({ providedIn: 'root' })
export class TermsService {
  private _cache = signal<string | null>(null);
  readonly content = computed(() => this._cache());

  async load(lang: typeof TERMS_LANG = TERMS_LANG): Promise<string> {
    try {
      const res = await fetch(`/legal/terms-${lang}.md`);
      if (!res.ok) {
        return '(no se pudo cargar el documento, intente más tarde)';
      }
      const text = await res.text();
      this._cache.set(text);
      return text;
    } catch {
      return '(no se pudo cargar el documento, intente más tarde)';
    }
  }
}
