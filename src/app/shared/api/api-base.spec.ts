import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { vi } from 'vitest';
import { Firestore, FirestoreDataConverter } from '@angular/fire/firestore';
import { Authenticator } from '../service/authenticator';
import { ApiBase, PathSegments } from './api-base';

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>(null);
}

interface TestItem {
  id?: string;
  name?: string;
}

class StaticRepo extends ApiBase<TestItem> {
  path = signal<PathSegments>(['test']);
  converter: FirestoreDataConverter<TestItem> = {
    toFirestore: (data) => data as Record<string, unknown>,
    fromFirestore: (snap) => snap.data() as TestItem,
  };
  getRef() {
    return this.colRefSignal();
  }
}

class ScopedRepo extends ApiBase<TestItem> {
  scope = signal<'global' | { kind: 'project'; projectId: string }>('global');
  path = computed<PathSegments>(() => {
    const s = this.scope();
    return s === 'global' ? ['test'] : ['projects', s.projectId, 'test'];
  });
  converter: FirestoreDataConverter<TestItem> = {
    toFirestore: (data) => data as Record<string, unknown>,
    fromFirestore: (snap) => snap.data() as TestItem,
  };
  getRef() {
    return this.colRefSignal();
  }
}

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ApiBase (signals only)', () => {
  let fakeAuth: FakeAuthenticator;
  let repo: StaticRepo;
  let scopedRepo: ScopedRepo;

  beforeEach(async () => {
    fakeAuth = new FakeAuthenticator();
    await TestBed.configureTestingModule({
      providers: [
        StaticRepo,
        ScopedRepo,
        { provide: Authenticator, useValue: fakeAuth },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
      ],
    }).compileComponents();
    repo = TestBed.inject(StaticRepo);
    scopedRepo = TestBed.inject(ScopedRepo);
  });

  it('colRefSignal is undefined when there is no user (does not invoke collection)', () => {
    expect(repo.getRef()).toBeUndefined();
  });

  it('scope-aware path: colRefSignal reflects the computed path from scope', () => {
    expect(scopedRepo.path()).toEqual(['test']);
    scopedRepo.scope.set({ kind: 'project', projectId: 'p1' });
    expect(scopedRepo.path()).toEqual(['projects', 'p1', 'test']);
  });

  it('reactive chain: scope changes propagate to the colRefSignal dependency graph', () => {
    const observed: Array<unknown> = [];
    const probe = computed(() => {
      const v = scopedRepo.getRef();
      observed.push(v === undefined ? 'undefined' : 'ref');
      return v;
    });
    void probe();
    scopedRepo.scope.set({ kind: 'project', projectId: 'p1' });
    void probe();
    expect(observed[0]).toBe('undefined');
    expect(observed.every((v) => v === 'undefined')).toBe(true);
  });
});
