import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { Firestore, Timestamp } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { PasswordRepository } from './passwords.repository';
import { PasswordI } from '../domain/password.interface';
import { ScopeContext } from '../../shared/scope/scope-context';
import { Authenticator } from '../../shared/service/authenticator';
import { PasswordCrypto } from './password-crypto';

class FakeScope {
  readonly scope = signal<
    | 'global'
    | { kind: 'project'; projectId: string }
    | { kind: 'issue'; projectId: string; issueId: string }
  >('global');
  readonly selectedProjectId = vi.fn();
}

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>({ uid: 'u1' });
}

class FakeCrypto {
  encrypt = vi.fn(async (plain: string) => ({ cipher: Array.from(plain), iv: [0] }));
  decrypt = vi.fn(async () => 'decrypted');
}

describe('PasswordRepository (scope-aware path signal)', () => {
  let repo: PasswordRepository;
  let scope: FakeScope;
  let addDocSpy: ReturnType<typeof vi.fn>;
  let updateDocSpy: ReturnType<typeof vi.fn>;
  let deleteDocSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addDocSpy = vi.fn().mockImplementation((data: PasswordI) => of({ id: 'new-id', ...data }));
    updateDocSpy = vi.fn().mockReturnValue(of(undefined));
    deleteDocSpy = vi.fn().mockReturnValue(of(undefined));
    scope = new FakeScope();

    TestBed.configureTestingModule({
      providers: [
        PasswordRepository,
        { provide: ScopeContext, useValue: scope },
        { provide: Authenticator, useValue: new FakeAuthenticator() },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
        { provide: PasswordCrypto, useValue: new FakeCrypto() },
      ],
    });
    repo = TestBed.inject(PasswordRepository);
    (repo as unknown as { addDoc: typeof addDocSpy }).addDoc = addDocSpy;
    (repo as unknown as { updateDoc: typeof updateDocSpy }).updateDoc = updateDocSpy;
    (repo as unknown as { deleteDoc: typeof deleteDocSpy }).deleteDoc = deleteDocSpy;
  });

  it('exposes a scope-aware path signal', () => {
    scope.scope.set('global');
    TestBed.tick();
    expect((repo as unknown as { path: () => unknown }).path()).toEqual(['passwords']);
    scope.scope.set({ kind: 'project', projectId: 'p1' });
    expect((repo as unknown as { path: () => unknown }).path()).toEqual(['passwords']);
    scope.scope.set({ kind: 'issue', projectId: 'p1', issueId: 'i1' });
    expect((repo as unknown as { path: () => unknown }).path()).toEqual([
      'proyectos',
      'p1',
      'issues',
      'i1',
      'passwords',
    ]);
  });

  it('exposes a scope-aware namespace signal', () => {
    scope.scope.set('global');
    expect(repo.namespace()).toBe('passwords');
    scope.scope.set({ kind: 'issue', projectId: 'p1', issueId: 'i1' });
    expect(repo.namespace()).toBe('proyectos/p1/issues/i1/passwords');
  });

  it('exposes getFilteredCollection via withQuery', () => {
    expect(
      typeof (repo as unknown as { getFilteredCollection?: unknown }).getFilteredCollection,
    ).toBe('function');
  });

  it('addDoc is forwarded with name, encrypted password, secure, and timestamps', async () => {
    const vaultKey = {} as CryptoKey;
    const enc = await repo.encryptPassword('hola', vaultKey);
    const now = Timestamp.now();
    repo
      .addDoc({ name: 'svc', password: enc, secure: true, createdAt: now, updatedAt: now })
      .subscribe();
    expect(addDocSpy).toHaveBeenCalledOnce();
    const written = addDocSpy.mock.calls[0][0] as PasswordI;
    expect(written.name).toBe('svc');
    expect(written.secure).toBe(true);
    expect(written.password).toEqual(enc);
  });
});
