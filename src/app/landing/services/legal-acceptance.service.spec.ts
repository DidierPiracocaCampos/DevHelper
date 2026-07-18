import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { LegalAcceptanceService } from './legal-acceptance.service';

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('LegalAcceptanceService', () => {
  let service: LegalAcceptanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LegalAcceptanceService, { provide: Firestore, useValue: { __fake: true } }],
    });
    service = TestBed.inject(LegalAcceptanceService);
  });

  it('needsReAcceptance returns true when current is null', () => {
    expect(service.needsReAcceptance(null)).toBe(true);
  });

  it('needsReAcceptance returns false when version matches', () => {
    expect(
      service.needsReAcceptance({
        version: '2026-07-18',
        lang: 'es',
        acceptedAt: {} as never,
        source: 'register',
      }),
    ).toBe(false);
  });

  it('needsReAcceptance returns true when version is outdated', () => {
    expect(
      service.needsReAcceptance({
        version: '2026-01-01',
        lang: 'es',
        acceptedAt: {} as never,
        source: 'manual',
      }),
    ).toBe(true);
  });

  it('docPath returns users/{uid}/legal/termsAccepted', () => {
    expect(LegalAcceptanceService.docPath('user-1')).toBe('users/user-1/legal/termsAccepted');
  });

  it('docPath handles different uids', () => {
    expect(LegalAcceptanceService.docPath('abc-123')).toBe('users/abc-123/legal/termsAccepted');
  });

  it('current invokes docPath to read users/{uid}/legal/termsAccepted', () => {
    const pathSpy = vi.spyOn(LegalAcceptanceService, 'docPath');
    let error: unknown;
    try {
      service.current('user-1');
    } catch (e) {
      error = e;
    }
    expect(pathSpy).toHaveBeenCalledWith('user-1');
    expect(pathSpy).toHaveReturnedWith('users/user-1/legal/termsAccepted');
    expect(error).toBeInstanceOf(Error);
    pathSpy.mockRestore();
  });

  it('accept invokes docPath to write the terms-acceptance shape at users/{uid}/legal/termsAccepted', async () => {
    const pathSpy = vi.spyOn(LegalAcceptanceService, 'docPath');
    let error: unknown;
    try {
      await service.accept('user-1', 'register');
    } catch (e) {
      error = e;
    }
    expect(pathSpy).toHaveBeenCalledWith('user-1');
    expect(pathSpy).toHaveReturnedWith('users/user-1/legal/termsAccepted');
    expect(error).toBeInstanceOf(Error);
    pathSpy.mockRestore();
  });
});
