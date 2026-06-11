import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { Authenticator } from '../../service/authenticator';
import { ScopeContext } from '../../scope/scope-context';
import { FileRepository } from './file-repository';

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>(null);
}

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('FileRepository (scope-aware path signal)', () => {
  let fakeAuth: FakeAuthenticator;
  let scope: ScopeContext;
  let repo: FileRepository;

  beforeEach(async () => {
    fakeAuth = new FakeAuthenticator();
    await TestBed.configureTestingModule({
      providers: [
        FileRepository,
        ScopeContext,
        { provide: Authenticator, useValue: fakeAuth },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
      ],
    }).compileComponents();
    repo = TestBed.inject(FileRepository);
    scope = TestBed.inject(ScopeContext);
  });

  it('path resolves to ["files"] when scope is global', () => {
    expect((repo as unknown as { path: () => readonly string[] }).path()).toEqual(['files']);
    expect((repo as unknown as { namespace: () => string }).namespace()).toBe('files');
  });

  it('path resolves to issue path when scope is issue', () => {
    scope.setIssue('p1', 'i1');
    expect((repo as unknown as { path: () => readonly string[] }).path()).toEqual([
      'proyectos',
      'p1',
      'issues',
      'i1',
      'files',
    ]);
    expect((repo as unknown as { namespace: () => string }).namespace()).toBe(
      'proyectos/p1/issues/i1/files',
    );
  });

  it('path toggles back to global when scope is reset', () => {
    scope.setIssue('p1', 'i1');
    scope.setGlobal();
    expect((repo as unknown as { path: () => readonly string[] }).path()).toEqual(['files']);
  });

  it('colRefSignal is undefined when no user is signed in', () => {
    fakeAuth.user.set(null);
    expect(
      (repo as unknown as { colRefSignal: () => unknown }).colRefSignal(),
    ).toBeUndefined();
  });
});
