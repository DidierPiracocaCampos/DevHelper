import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { Authenticator } from '../../service/authenticator';
import { NasaImageRepository } from './nasa-image.repository';

class FakeAuthenticator {
  readonly user = signal<{ uid: string } | null>(null);
}

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('NasaImageRepository', () => {
  let fakeAuth: FakeAuthenticator;
  let repo: NasaImageRepository;

  beforeEach(async () => {
    fakeAuth = new FakeAuthenticator();
    await TestBed.configureTestingModule({
      providers: [
        NasaImageRepository,
        { provide: Authenticator, useValue: fakeAuth },
        { provide: Firestore, useValue: { __fake: true } as unknown as Firestore },
      ],
    }).compileComponents();
    repo = TestBed.inject(NasaImageRepository);
  });

  it('path reflects the ["nasa-image"] namespace', () => {
    expect((repo as unknown as { path: () => readonly string[] }).path()).toEqual(['nasa-image']);
  });
});
