import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { LegalAcceptanceService } from '../../services/legal-acceptance.service';
import { TermsModal } from './terms-modal';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
    this.open = true;
  };
}

function makeAuth(user: { uid: string } | null) {
  return {
    user: signal(user),
    isLoggedIn: signal(!!user),
  };
}

function makeLegal(current: { version: string } | null) {
  const needsReAcceptance = (c: { version: string } | null) => !c || c.version !== '2026-07-18';
  return {
    current: vi.fn().mockReturnValue(of(current)),
    accept: vi.fn().mockResolvedValue(undefined),
    needsReAcceptance: vi.fn().mockImplementation(needsReAcceptance),
  };
}

function isDialogOpen(host: HTMLElement): boolean {
  const dlg = host.querySelector('dialog');
  return !!dlg && dlg.open;
}

describe('TermsModal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('renders the "Revisar" link to /legal/terms', () => {
    const auth = makeAuth(null);
    const legal = makeLegal(null);
    TestBed.overrideProvider(Authenticator, { useValue: auth });
    TestBed.overrideProvider(LegalAcceptanceService, { useValue: legal });
    const fixture = TestBed.createComponent(TermsModal);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="/legal/terms"]');
    expect(link).toBeTruthy();
  });

  it('dialog is closed when user is logged in and version matches', () => {
    const auth = makeAuth({ uid: 'u1' });
    const legal = makeLegal({ version: '2026-07-18' });
    TestBed.overrideProvider(Authenticator, { useValue: auth });
    TestBed.overrideProvider(LegalAcceptanceService, { useValue: legal });
    const fixture = TestBed.createComponent(TermsModal);
    fixture.detectChanges();
    expect(isDialogOpen(fixture.nativeElement as HTMLElement)).toBe(false);
  });

  it('dialog is closed when no user is logged in', () => {
    const auth = makeAuth(null);
    const legal = makeLegal(null);
    TestBed.overrideProvider(Authenticator, { useValue: auth });
    TestBed.overrideProvider(LegalAcceptanceService, { useValue: legal });
    const fixture = TestBed.createComponent(TermsModal);
    fixture.detectChanges();
    expect(isDialogOpen(fixture.nativeElement as HTMLElement)).toBe(false);
  });

  it('does not open dialog while acceptance is loading even if user is logged in and no doc exists', () => {
    const auth = makeAuth({ uid: 'u1' });
    const neverEmit$ = new Observable<{ version: string } | null>((_sub) => {
      // never emits, simulating a Firestore read that is still in flight
    });
    const legal = {
      current: vi.fn().mockReturnValue(neverEmit$),
      accept: vi.fn().mockResolvedValue(undefined),
      needsReAcceptance: (c: { version: string } | null) => !c || c.version !== '2026-07-18',
    };
    TestBed.overrideProvider(Authenticator, { useValue: auth });
    TestBed.overrideProvider(LegalAcceptanceService, { useValue: legal });
    const fixture = TestBed.createComponent(TermsModal);
    fixture.detectChanges();
    expect(isDialogOpen(fixture.nativeElement as HTMLElement)).toBe(false);
  });

  it('opens dialog after acceptance loads and version mismatches', () => {
    const auth = makeAuth({ uid: 'u1' });
    const legal = makeLegal({ version: '2026-07-01' });
    TestBed.overrideProvider(Authenticator, { useValue: auth });
    TestBed.overrideProvider(LegalAcceptanceService, { useValue: legal });
    const fixture = TestBed.createComponent(TermsModal);
    fixture.detectChanges();
    expect(isDialogOpen(fixture.nativeElement as HTMLElement)).toBe(true);
  });
});
