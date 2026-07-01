import { Injectable, computed, inject, Signal } from '@angular/core';
import { FirestoreDataConverter, Timestamp } from '@angular/fire/firestore';
import { ApiBase, PathSegments } from '../../shared/api/api-base';
import {
  withCollection,
  withAddDoc,
  withUpdateDoc,
  withDocDelete,
  withQuery,
} from '../../shared/api/crud.mixins';
import { IssueI, IssueCreateInput, IssueStatus, IssueUpdateInput } from '../domain/issue.interface';
import { ScopeContext } from '../../shared/scope/scope-context';

const SENTINEL_PROJECT = '_no_project_';

@Injectable({
  providedIn: 'root',
})
export class IssueRepository extends withQuery<IssueI>()(
  withUpdateDoc<IssueI>()(
    withDocDelete<IssueI>()(withAddDoc<IssueI>()(withCollection<IssueI>()(ApiBase<IssueI>))),
  ),
) {
  private readonly _scope = inject(ScopeContext);

  protected override path: Signal<PathSegments> = computed<PathSegments>(() => {
    const projectId = this._scope.selectedProjectId();
    return projectId
      ? (['proyectos', projectId, 'issues'] as const)
      : (['proyectos', SENTINEL_PROJECT, 'issues'] as const);
  });

  protected converter: FirestoreDataConverter<IssueI> = {
    toFirestore: (data: IssueI) => {
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore: (snap) => snap.data() as IssueI,
  };

  addIssue(input: IssueCreateInput) {
    const now = Timestamp.now();
    const payload: IssueI = {
      title: input.title,
      status: input.isNote ? null : (input.status ?? 'pending'),
      isNote: input.isNote,
      priority: input.priority ?? 'normal',
      createdAt: now,
      updatedAt: now,
    };
    if (input.description !== undefined) payload.description = input.description;
    if (input.solution !== undefined) payload.solution = input.solution;
    if (!input.isNote && input.dueAt !== undefined) payload.dueAt = input.dueAt;
    return this.addDoc(payload);
  }

  updateIssue(id: string, patch: IssueUpdateInput) {
    return this.updateDoc(id, { ...patch, updatedAt: Timestamp.now() });
  }

  deleteIssue(id: string) {
    return this.deleteDoc(id);
  }

  toggleStatus(id: string, current: IssueStatus) {
    const next: IssueStatus = current === 'done' || current === null ? 'pending' : 'done';
    return this.updateIssue(id, { status: next });
  }
}
