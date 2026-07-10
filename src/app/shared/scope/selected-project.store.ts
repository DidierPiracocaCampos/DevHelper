import { Injectable, inject } from '@angular/core';
import { ScopeContext } from './scope-context';

const STORAGE_KEY = 'devhelper:selectedProjectId';

@Injectable({ providedIn: 'root' })
export class SelectedProjectStore {
  private readonly _scope = inject(ScopeContext);

  readonly selectedId = this._scope.selectedProjectId;

  set(projectId: string): void {
    this._scope.setProject(projectId);
    this._write(projectId);
  }

  clear(): void {
    this._scope.setGlobal();
    this._write(null);
  }

  readSaved(): string | null {
    try {
      return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private _write(id: string | null): void {
    try {
      if (id) {
        globalThis.localStorage?.setItem(STORAGE_KEY, id);
      } else {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore quota / disabled storage
    }
  }
}
