import { Injectable, signal } from '@angular/core';

export type Scope = 'global' | { kind: 'project'; projectId: string };

@Injectable({ providedIn: 'root' })
export class ScopeContext {
  readonly scope = signal<Scope>('global');

  setGlobal(): void {
    this.scope.set('global');
  }

  setProject(projectId: string): void {
    this.scope.set({ kind: 'project', projectId });
  }
}
