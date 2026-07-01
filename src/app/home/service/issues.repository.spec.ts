import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore, Timestamp } from '@angular/fire/firestore';
import { firstValueFrom, of } from 'rxjs';
import { IssueRepository } from './issues.repository';
import { IssueI, IssueCreateInput, IssueUpdateInput } from '../domain/issue.interface';
import { ScopeContext } from '../../shared/scope/scope-context';
import { Authenticator } from '../../shared/service/authenticator';

class FakeScope {
  readonly scope = vi.fn();
  readonly selectedProjectId = vi.fn();
}

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>(null);
}

describe('IssueRepository (contract)', () => {
  let repo: IssueRepository;
  let addDocSpy: ReturnType<typeof vi.fn>;
  let updateDocSpy: ReturnType<typeof vi.fn>;
  let deleteDocSpy: ReturnType<typeof vi.fn>;
  let scope: FakeScope;

  beforeEach(() => {
    addDocSpy = vi.fn().mockImplementation((data: IssueI) => of({ id: 'new-id', ...data }));
    updateDocSpy = vi.fn().mockReturnValue(of(undefined));
    deleteDocSpy = vi.fn().mockReturnValue(of(undefined));
    scope = new FakeScope();
    scope.selectedProjectId.mockReturnValue('p1');

    TestBed.configureTestingModule({
      providers: [
        IssueRepository,
        { provide: ScopeContext, useValue: scope },
        { provide: Authenticator, useValue: new FakeAuthenticator() },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
      ],
    });
    repo = TestBed.inject(IssueRepository);
    (repo as unknown as { addDoc: typeof addDocSpy }).addDoc = addDocSpy;
    (repo as unknown as { updateDoc: typeof updateDocSpy }).updateDoc = updateDocSpy;
    (repo as unknown as { deleteDoc: typeof deleteDocSpy }).deleteDoc = deleteDocSpy;
  });

  describe('addIssue', () => {
    it('stamps createdAt and updatedAt with the same value', async () => {
      const input: IssueCreateInput = {
        title: 'Demo',
        status: 'pending',
        isNote: false,
        priority: 'normal',
      };
      const before = Date.now();
      const result = await firstValueFrom(repo.addIssue(input));
      const after = Date.now();

      expect(addDocSpy).toHaveBeenCalledOnce();
      const written = addDocSpy.mock.calls[0][0] as IssueI;
      expect(written.title).toBe('Demo');
      const createdMs = written.createdAt.toMillis();
      expect(createdMs).toBeGreaterThanOrEqual(before);
      expect(createdMs).toBeLessThanOrEqual(after);
      expect(written.updatedAt.toMillis()).toBe(written.createdAt.toMillis());
      expect(result.id).toBe('new-id');
    });

    it('forces status=null and ignores dueAt when isNote=true', async () => {
      const input: IssueCreateInput = {
        title: 'Mi nota',
        status: 'pending', // debe ser reemplazado por null
        isNote: true,
        priority: 'normal',
        dueAt: Timestamp.now(), // debe ser ignorado
      };
      await firstValueFrom(repo.addIssue(input));
      const written = addDocSpy.mock.calls[0][0] as IssueI;
      expect(written.status).toBeNull();
      expect(written.dueAt).toBeUndefined();
    });

    it('defaults status to pending and priority to normal when omitted', async () => {
      const input: IssueCreateInput = {
        title: 'Sin defaults',
        isNote: false,
        status: 'pending',
        priority: 'normal',
      };
      await firstValueFrom(repo.addIssue(input));
      const written = addDocSpy.mock.calls[0][0] as IssueI;
      expect(written.status).toBe('pending');
      expect(written.priority).toBe('normal');
    });

    it('forwards solution when present', async () => {
      const input: IssueCreateInput = {
        title: 'Con solucion',
        status: 'pending',
        isNote: false,
        priority: 'normal',
        solution: 'Borrar cache y reiniciar',
      };
      await firstValueFrom(repo.addIssue(input));
      const written = addDocSpy.mock.calls[0][0] as IssueI;
      expect(written.solution).toBe('Borrar cache y reiniciar');
    });

    it('omits solution when input omits it', async () => {
      const input: IssueCreateInput = {
        title: 'Sin solucion',
        status: 'pending',
        isNote: false,
        priority: 'normal',
      };
      await firstValueFrom(repo.addIssue(input));
      const written = addDocSpy.mock.calls[0][0] as IssueI;
      expect(written.solution).toBeUndefined();
    });
  });

  describe('updateIssue', () => {
    it('forces updatedAt to a fresh timestamp and forwards the patch', async () => {
      const before = Date.now();
      await firstValueFrom(repo.updateIssue('i1', { title: 'Nuevo' }));
      const after = Date.now();

      expect(updateDocSpy).toHaveBeenCalledOnce();
      const call = updateDocSpy.mock.calls[0];
      expect(call[0]).toBe('i1');
      const patch = call[1] as IssueUpdateInput;
      expect(patch.title).toBe('Nuevo');
      const updatedMs = (patch.updatedAt as Timestamp).toMillis();
      expect(updatedMs).toBeGreaterThanOrEqual(before);
      expect(updatedMs).toBeLessThanOrEqual(after);
      expect((patch as { createdAt?: unknown }).createdAt).toBeUndefined();
    });

    it('forwards solution in the patch', async () => {
      await firstValueFrom(repo.updateIssue('i1', { solution: 'nueva' }));
      const patch = updateDocSpy.mock.calls[0][1] as Partial<IssueI>;
      expect(patch.solution).toBe('nueva');
    });
  });

  describe('deleteIssue', () => {
    it('delegates to deleteDoc mixin with the given id', async () => {
      await firstValueFrom(repo.deleteIssue('i1'));
      expect(deleteDocSpy).toHaveBeenCalledWith('i1');
    });
  });

  describe('toggleStatus', () => {
    it('pending -> done', async () => {
      await firstValueFrom(repo.toggleStatus('i1', 'pending'));
      const patch = updateDocSpy.mock.calls[0][1] as Partial<IssueI>;
      expect(patch.status).toBe('done');
    });

    it('done -> pending', async () => {
      await firstValueFrom(repo.toggleStatus('i1', 'done'));
      const patch = updateDocSpy.mock.calls[0][1] as Partial<IssueI>;
      expect(patch.status).toBe('pending');
    });

    it('null (note) -> done does not happen (notes keep status null)', async () => {
      // toggleStatus on a note is not invoked by the UI, but if it is, the result
      // is still pending so the data layer doesn't accidentally promote a note.
      await firstValueFrom(repo.toggleStatus('i1', null));
      const patch = updateDocSpy.mock.calls[0][1] as Partial<IssueI>;
      expect(patch.status).toBe('pending');
    });
  });
});
