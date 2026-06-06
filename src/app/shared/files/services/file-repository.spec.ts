import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { Authenticator } from '../../service/authenticator';
import { ApiBase } from '../../api/api-base';
import { FileMetadataI } from '../models/file.model';

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>(null);
}

class StaticFileRepo extends ApiBase<FileMetadataI> {
  path = signal<['files']>(['files']);
  converter = {
    toFirestore: (data: FileMetadataI) => data as unknown as Record<string, unknown>,
    fromFirestore: (snap: { data: () => unknown }) => snap.data() as FileMetadataI,
  } as never;
  getRef() {
    return this.colRefSignal();
  }
}

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('FileRepository (ApiBase path signal)', () => {
  let fakeAuth: FakeAuthenticator;
  let repo: StaticFileRepo;

  beforeEach(async () => {
    fakeAuth = new FakeAuthenticator();
    await TestBed.configureTestingModule({
      providers: [
        StaticFileRepo,
        { provide: Authenticator, useValue: fakeAuth },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
      ],
    }).compileComponents();
    repo = TestBed.inject(StaticFileRepo);
  });

  it('colRefSignal is undefined when no user is signed in', () => {
    expect(repo.getRef()).toBeUndefined();
  });

  it('path signal reflects ["files"] namespace', () => {
    expect(repo.path()).toEqual(['files']);
  });

  it('colRefSignal is undefined for both unscoped and scoped repos when no user', () => {
    const observed: Array<unknown> = [];
    const probe = () => {
      const v = repo.getRef();
      observed.push(v === undefined ? 'undefined' : 'ref');
    };
    probe();
    fakeAuth.user.set({ uid: 'u1' });
    fakeAuth.user.set(null);
    probe();
    expect(observed.every((v) => v === 'undefined')).toBe(true);
  });
});
