import { Injectable, computed, signal } from '@angular/core';

export type Scope =
  | 'global'
  | { kind: 'project'; projectId: string }
  | { kind: 'issue'; projectId: string; issueId: string };

@Injectable({ providedIn: 'root' })
export class ScopeContext {
  readonly scope = signal<Scope>('global');

  readonly isGlobal = computed(() => this.scope() === 'global');

  readonly isIssue = computed(() => {
    const s = this.scope();
    return typeof s === 'object' && s.kind === 'issue';
  });

  readonly selectedProjectId = computed<string | null>(() => {
    const s = this.scope();
    if (typeof s === 'object' && (s.kind === 'project' || s.kind === 'issue')) {
      return s.projectId;
    }
    return null;
  });

  setGlobal(): void {
    this.scope.set('global');
  }

  setProject(projectId: string): void {
    this.scope.set({ kind: 'project', projectId });
  }

  setIssue(projectId: string, issueId: string): void {
    this.scope.set({ kind: 'issue', projectId, issueId });
  }
}
