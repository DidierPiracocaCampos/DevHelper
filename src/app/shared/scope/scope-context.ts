import { Injectable, computed, signal } from '@angular/core';

export type Scope = 'global' | { kind: 'issue'; projectId: string; issueId: string };

@Injectable({ providedIn: 'root' })
export class ScopeContext {
  readonly scope = signal<Scope>('global');

  readonly isGlobal = computed(() => this.scope() === 'global');

  readonly isIssue = computed(() => this.scope() !== 'global');

  setGlobal(): void {
    this.scope.set('global');
  }

  setIssue(projectId: string, issueId: string): void {
    this.scope.set({ kind: 'issue', projectId, issueId });
  }
}
