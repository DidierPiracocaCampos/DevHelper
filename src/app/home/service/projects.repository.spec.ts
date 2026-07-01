import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom, of, Observable } from 'rxjs';
import { ProjectRepository } from './projects.repository';
import { ProjectI, ProjectCreateInput, ProjectUpdateInput } from '../domain/project.interface';

class FakeProjectRepository {
  readonly addDocSpy = vi.fn();
  readonly updateDocSpy = vi.fn();
  readonly deleteDocSpy = vi.fn();

  getCollection() {
    return {
      value: (): (ProjectI & { id: string })[] | undefined => undefined,
      isLoading: (): boolean => false,
      hasValue: (): boolean => false,
      error: (): unknown => undefined,
      reload: vi.fn(),
    };
  }

  addProject(input: ProjectCreateInput): Observable<ProjectI & { id: string }> {
    const now = Timestamp.now();
    const payload: ProjectI = {
      ...input,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.addDocSpy(payload);
    return of({ id: 'new-id', ...payload });
  }

  updateProject(id: string, patch: ProjectUpdateInput): Observable<void> {
    this.updateDocSpy(id, { ...patch, updatedAt: Timestamp.now() });
    return of(undefined);
  }

  archiveProject(id: string, archived: boolean): Observable<void> {
    return this.updateProject(id, { archived });
  }

  deleteProject(id: string): Observable<void> {
    this.deleteDocSpy(id);
    return of(undefined);
  }
}

describe('ProjectRepository (contract)', () => {
  let repo: FakeProjectRepository;

  beforeEach(() => {
    const fake = new FakeProjectRepository();
    TestBed.configureTestingModule({
      providers: [{ provide: ProjectRepository, useValue: fake }],
    });
    repo = TestBed.inject(ProjectRepository) as unknown as FakeProjectRepository;
  });

  describe('addProject', () => {
    it('stamps createdAt, updatedAt and archived=false', async () => {
      const input: ProjectCreateInput = {
        name: 'Yedra',
        tag: 'frontend',
        description: 'desc',
      };
      const before = Date.now();
      const result = await firstValueFrom(repo.addProject(input));
      const after = Date.now();

      expect(repo.addDocSpy).toHaveBeenCalledOnce();
      const written = repo.addDocSpy.mock.calls[0][0] as ProjectI;
      expect(written.name).toBe('Yedra');
      expect(written.tag).toBe('frontend');
      expect(written.description).toBe('desc');
      expect(written.archived).toBe(false);
      const createdMs = written.createdAt.toMillis();
      expect(createdMs).toBeGreaterThanOrEqual(before);
      expect(createdMs).toBeLessThanOrEqual(after);
      expect(written.updatedAt.toMillis()).toBe(written.createdAt.toMillis());
      expect(result.id).toBe('new-id');
    });

    it('allows omitting optional fields', async () => {
      await firstValueFrom(repo.addProject({ name: 'Solo nombre' }));
      const written = repo.addDocSpy.mock.calls[0][0] as ProjectI;
      expect(written.name).toBe('Solo nombre');
      expect(written.tag).toBeUndefined();
      expect(written.description).toBeUndefined();
    });
  });

  describe('updateProject', () => {
    it('forces updatedAt to a fresh timestamp and forwards the patch', async () => {
      const before = Date.now();
      await firstValueFrom(repo.updateProject('p1', { name: 'Nuevo' }));
      const after = Date.now();

      expect(repo.updateDocSpy).toHaveBeenCalledOnce();
      const call = repo.updateDocSpy.mock.calls[0];
      expect(call[0]).toBe('p1');
      const patch = call[1] as Partial<ProjectI>;
      expect(patch.name).toBe('Nuevo');
      const updatedMs = (patch.updatedAt as Timestamp).toMillis();
      expect(updatedMs).toBeGreaterThanOrEqual(before);
      expect(updatedMs).toBeLessThanOrEqual(after);
      expect((patch as { createdAt?: unknown }).createdAt).toBeUndefined();
    });
  });

  describe('archiveProject', () => {
    it('delegates to updateProject with the archived flag', async () => {
      await firstValueFrom(repo.archiveProject('p1', true));
      const call = repo.updateDocSpy.mock.calls[0];
      expect(call[0]).toBe('p1');
      expect((call[1] as { archived: boolean }).archived).toBe(true);
    });

    it('also supports unarchiving', async () => {
      await firstValueFrom(repo.archiveProject('p1', false));
      const call = repo.updateDocSpy.mock.calls[0];
      expect((call[1] as { archived: boolean }).archived).toBe(false);
    });
  });

  describe('deleteProject', () => {
    it('delegates to deleteDoc mixin with the given id', async () => {
      await firstValueFrom(repo.deleteProject('p1'));
      expect(repo.deleteDocSpy).toHaveBeenCalledWith('p1');
    });
  });
});
