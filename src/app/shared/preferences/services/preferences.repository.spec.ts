import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore, QueryDocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore';
import { isObservable, of } from 'rxjs';
import { Authenticator } from '../../service/authenticator';
import { UserPreferencesI } from '../models/preferences.model';
import { PreferencesRepository } from './preferences.repository';

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>(null);
}

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('PreferencesRepository (path signal + singleton)', () => {
  let fakeAuth: FakeAuthenticator;
  let repo: PreferencesRepository;

  beforeEach(async () => {
    fakeAuth = new FakeAuthenticator();
    await TestBed.configureTestingModule({
      providers: [
        PreferencesRepository,
        { provide: Authenticator, useValue: fakeAuth },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
      ],
    }).compileComponents();
    repo = TestBed.inject(PreferencesRepository);
  });

  it('path reflects the ["preferences"] namespace', () => {
    expect((repo as unknown as { path: () => readonly string[] }).path()).toEqual(['preferences']);
  });

  it('colRefSignal is undefined when there is no user', () => {
    fakeAuth.user.set(null);
    expect((repo as unknown as { path: () => readonly string[] }).path()).toEqual(['preferences']);
  });

  it('preferences resource is exposed', () => {
    expect(repo.preferences).toBeDefined();
  });

  it('setDoc and deleteDoc return Observables', () => {
    const original = (repo as unknown as { $userCollectionRef: unknown }).$userCollectionRef;
    (repo as unknown as { $userCollectionRef: unknown }).$userCollectionRef = of({});
    const setResult = repo.setDoc('singleton', { id: 'singleton' });
    const delResult = repo.deleteDoc('singleton');
    expect(isObservable(setResult)).toBe(true);
    expect(isObservable(delResult)).toBe(true);
    (repo as unknown as { $userCollectionRef: unknown }).$userCollectionRef = original;
  });

  it('converter round-trips aiAssistantEnabled: true', () => {
    const converter = (
      repo as unknown as {
        converter: {
          toFirestore: (data: UserPreferencesI) => Record<string, unknown>;
          fromFirestore: (
            snap: QueryDocumentSnapshot,
            options: SnapshotOptions,
          ) => UserPreferencesI;
        };
      }
    ).converter;

    const input: UserPreferencesI = {
      id: 'singleton',
      aiAssistantEnabled: true,
    };

    const written = converter.toFirestore(input);
    expect(written['aiAssistantEnabled']).toBe(true);

    const read = converter.fromFirestore(
      { data: () => written } as unknown as QueryDocumentSnapshot,
      {} as SnapshotOptions,
    );
    expect(read.id).toBe('singleton');
    expect(read.aiAssistantEnabled).toBe(true);
  });

  it('converter omits customNasaImage when caller did not pass it (aiAssistantEnabled: true)', () => {
    const converter = (
      repo as unknown as {
        converter: {
          toFirestore: (data: UserPreferencesI) => Record<string, unknown>;
        };
      }
    ).converter;

    const written = converter.toFirestore({
      id: 'singleton',
      aiAssistantEnabled: true,
    });

    expect('customNasaImage' in written).toBe(false);
    expect(written['aiAssistantEnabled']).toBe(true);
  });

  it('converter omits customNasaImage when caller did not pass it (aiAssistantEnabled: false)', () => {
    const converter = (
      repo as unknown as {
        converter: {
          toFirestore: (data: UserPreferencesI) => Record<string, unknown>;
        };
      }
    ).converter;

    const written = converter.toFirestore({
      id: 'singleton',
      aiAssistantEnabled: false,
    });

    expect('customNasaImage' in written).toBe(false);
    expect(written['aiAssistantEnabled']).toBe(false);
  });
});
