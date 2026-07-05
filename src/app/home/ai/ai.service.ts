import { Injectable, inject, signal } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { EmbeddingService } from './embedding.service';
import { QueryIntentService } from './query-intent.service';
import { VaultSecurity } from '../../shared/security/vault-security';
import { ProjectRepository } from '../service/projects.repository';
import { IssueRepository } from '../service/issues.repository';
import { PasswordRepository } from '../service/passwords.repository';
import { Authenticator } from '../../shared/service/authenticator';
import {
  AiResult,
  AiMatchedDoc,
  AiStatus,
  VaultLockedError,
  ModelNotReadyError,
} from './ai-result.model';
import { MODEL_VERSION } from './ai-intent.enum';
import { getAllEmbeddings, putEmbedding, deleteEmbedding } from './idb';
import { renderPending } from './templates/pending.template';
import { renderDone } from './templates/done.template';
import { renderProjects } from './templates/projects.template';
import { renderOverdue } from './templates/overdue.template';
import { renderToday } from './templates/today.template';
import { renderWeek } from './templates/week.template';
import { renderByProject } from './templates/by-project.template';
import { renderByTag } from './templates/by-tag.template';
import { renderSummary } from './templates/summary.template';
import { renderSearch } from './templates/search.template';
import { renderUnknown } from './templates/unknown.template';
import type { IssueI } from '../domain/issue.interface';
import type { ProjectI } from '../domain/project.interface';
import type { PasswordI } from '../domain/password.interface';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly _embedding = inject(EmbeddingService);
  private readonly _queryIntent = inject(QueryIntentService);
  private readonly _vault = inject(VaultSecurity);
  private readonly _auth = inject(Authenticator);
  private readonly _projects = inject(ProjectRepository);
  private readonly _issues = inject(IssueRepository);
  private readonly _passwords = inject(PasswordRepository);

  readonly status = signal<AiStatus>('disabled');
  readonly downloadProgress = signal<{ loaded: number; total: number } | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly lastResult = signal<AiResult | null>(null);

  private get uid(): string {
    return this._auth.user()?.uid ?? '';
  }

  async enable(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    if (this.status() === 'ready') return;
    this.status.set('downloading');
    try {
      await this._embedding.ensureModel((loaded, total) => {
        this.downloadProgress.set({ loaded, total });
        onProgress?.(loaded, total);
      });
      this.status.set('ready');
      this.reindexAll().catch((err) => {
        console.error('[AiService] reindex failed', err);
      });
    } catch (err) {
      this.status.set('error');
      throw err;
    }
  }

  disable(): void {
    this.status.set('disabled');
    this.lastResult.set(null);
  }

  async query(question: string): Promise<AiResult> {
    if (this.status() !== 'ready') throw new ModelNotReadyError();
    if (!this._vault.isUnlocked()) throw new VaultLockedError();

    this.isProcessing.set(true);
    try {
      const { intent, entity } = this._queryIntent.classify(question);
      const result = await this._routeIntent(intent, entity, question);
      this.lastResult.set(result);
      return result;
    } finally {
      this.isProcessing.set(false);
    }
  }

  private async _routeIntent(
    intent: string,
    entity: string | undefined,
    question: string,
  ): Promise<AiResult> {
    switch (intent) {
      case 'list_pending':
        return { intent: 'list_pending', ...this._listPending() };
      case 'list_done':
        return { intent: 'list_done', ...this._listDone() };
      case 'list_projects':
        return { intent: 'list_projects', ...this._listProjects() };
      case 'overdue':
        return { intent: 'overdue', ...this._listOverdue() };
      case 'today':
        return { intent: 'today', ...this._listToday() };
      case 'this_week':
        return { intent: 'this_week', ...this._listThisWeek() };
      case 'by_project':
        return { intent: 'by_project', ...this._listByProject(entity ?? '') };
      case 'by_tag':
        return { intent: 'by_tag', ...this._listByTag(entity ?? '') };
      case 'summary':
        return { intent: 'summary', ...this._summary(entity ?? 'workspace') };
      case 'search':
        return await this._search(question);
      default:
        return { intent: 'unknown', answer: renderUnknown(), matched: [] };
    }
  }

  private _listPending(): Pick<AiResult, 'answer' | 'matched'> {
    const issues = (this._issues.allDocs() as IssueI[]).filter(
      (i) => i.status === 'pending' && !i.isNote,
    );
    return { answer: renderPending(issues), matched: [] };
  }

  private _listDone(): Pick<AiResult, 'answer' | 'matched'> {
    const issues = (this._issues.allDocs() as IssueI[]).filter(
      (i) => i.status === 'done' && !i.isNote,
    );
    return { answer: renderDone(issues), matched: [] };
  }

  private _listProjects(): Pick<AiResult, 'answer' | 'matched'> {
    const projects = this._projects.allDocs() as ProjectI[];
    return { answer: renderProjects(projects), matched: [] };
  }

  private _listOverdue(): Pick<AiResult, 'answer' | 'matched'> {
    const now = new Date();
    const issues = (this._issues.allDocs() as IssueI[]).filter((i) => {
      if (i.status !== 'pending' || i.isNote) return false;
      if (!i.dueAt) return false;
      const d = i.dueAt instanceof Date ? i.dueAt : (i.dueAt as Timestamp).toDate();
      return d < now;
    });
    return { answer: renderOverdue(issues), matched: [] };
  }

  private _listToday(): Pick<AiResult, 'answer' | 'matched'> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const issues = (this._issues.allDocs() as IssueI[]).filter((i) => {
      if (!i.dueAt) return false;
      const d = i.dueAt instanceof Date ? i.dueAt : (i.dueAt as Timestamp).toDate();
      return d >= start && d <= end;
    });
    return { answer: renderToday(issues), matched: [] };
  }

  private _listThisWeek(): Pick<AiResult, 'answer' | 'matched'> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const issues = (this._issues.allDocs() as IssueI[]).filter((i) => {
      if (!i.dueAt) return false;
      const d = i.dueAt instanceof Date ? i.dueAt : (i.dueAt as Timestamp).toDate();
      return d >= start && d < end;
    });
    return { answer: renderWeek(issues), matched: [] };
  }

  private _listByProject(name: string): Pick<AiResult, 'answer' | 'matched'> {
    const projects = (this._projects.allDocs() as ProjectI[]).filter(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    if (projects.length === 0) {
      return { answer: `No encontré un proyecto llamado "${name}".`, matched: [] };
    }
    const project = projects[0];
    const issues = (this._issues.allDocs() as IssueI[]).filter(
      (i) => (i as { projectId?: string }).projectId === project.id,
    );
    return { answer: renderByProject(project.name, issues), matched: [] };
  }

  private _listByTag(tag: string): Pick<AiResult, 'answer' | 'matched'> {
    const issues = (this._issues.allDocs() as IssueI[]).filter(
      (i) => (i as { tag?: string }).tag?.toLowerCase() === tag.toLowerCase(),
    );
    return { answer: renderByTag(tag, issues), matched: [] };
  }

  private _summary(name: string): Pick<AiResult, 'answer' | 'matched'> {
    const projects = (this._projects.allDocs() as ProjectI[]).filter(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    const issues =
      projects.length > 0
        ? (this._issues.allDocs() as IssueI[]).filter(
            (i) => (i as { projectId?: string }).projectId === projects[0].id,
          )
        : (this._issues.allDocs() as IssueI[]).slice(0, 5);
    return { answer: renderSummary(name, issues), matched: [] };
  }

  private async _search(question: string): Promise<AiResult> {
    if (!this.uid) return { intent: 'search', answer: renderUnknown(), matched: [] };
    const queryVec = await this._embedding.encode(question);
    const all = await getAllEmbeddings(this.uid);
    const top = this._embedding.cosineTopK(queryVec, all, 5);
    const matched: AiMatchedDoc[] = top
      .filter((t) => t.score >= 0.4)
      .map((t) => ({
        id: t.candidate.docId,
        collection: t.candidate.collection,
        title: t.candidate.text.split(' ').slice(0, 6).join(' '),
        score: t.score,
      }));
    return { intent: 'search', answer: renderSearch(matched), matched };
  }

  async reindexAll(): Promise<void> {
    if (!this.uid || this.status() !== 'ready') return;
    const projects = (this._projects.allDocs() as ProjectI[]).map((p) => ({
      collection: 'proyectos' as const,
      docId: p.id!,
      text: `${p.name} ${p.description ?? ''} ${(p as { tag?: string }).tag ?? ''}`.trim(),
    }));
    const issues = (this._issues.allDocs() as IssueI[]).map((i) => ({
      collection: 'issues' as const,
      docId: i.id!,
      text: `${i.title} ${i.description ?? ''} ${(i as { tag?: string }).tag ?? ''}`.trim(),
    }));
    const passwords = (this._passwords.allDocs() as PasswordI[]).map((p) => ({
      collection: 'passwords' as const,
      docId: p.id!,
      text: `${p.name} ${(p as { url?: string }).url ?? ''}`.trim(),
    }));
    for (const item of [...projects, ...issues, ...passwords]) {
      await this.reindexDoc(this.uid, item.collection, item.docId, item.text);
    }
  }

  async reindexDoc(
    uid: string,
    collection: 'proyectos' | 'issues' | 'passwords',
    docId: string,
    text: string,
  ): Promise<void> {
    if (this.status() !== 'ready') return;
    const vector = await this._embedding.encode(text);
    await putEmbedding({
      uid,
      collection,
      docId,
      text,
      vector: Array.from(vector),
      modelVersion: MODEL_VERSION,
      updatedAt: Date.now(),
    });
  }

  async removeEmbedding(
    uid: string,
    collection: 'proyectos' | 'issues' | 'passwords',
    docId: string,
  ): Promise<void> {
    await deleteEmbedding(uid, collection, docId);
  }
}
