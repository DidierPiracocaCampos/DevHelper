import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Observable, of } from 'rxjs';
import { LegalTerms } from './legal-terms';
import { Authenticator } from '../../../shared/service/authenticator';
import { LegalAcceptanceService } from '../../services/legal-acceptance.service';
import { TermsService } from '../../services/terms.service';

class FakeAuth {
  readonly user = signal<{ uid: string } | null>(null);
  readonly isLoggedIn = computed(() => !!this.user());
  logout = (() => Promise.resolve()) as unknown as Authenticator['logout'];
}

class FakeTerms {
  readonly content = signal<string | null>(null);
  readonly load = vi.fn().mockImplementation(async () => {
    const text = '# Terminos y Condiciones\n\nCuerpo del documento.';
    this.content.set(text);
    return text;
  });
}

class FakeLegal {
  readonly needsReAcceptance = vi.fn().mockReturnValue(true);
  readonly accept = vi.fn().mockResolvedValue(undefined);
  readonly current = vi.fn().mockReturnValue(of(null));
}

describe('LegalTerms', () => {
  let auth: FakeAuth;
  let terms: FakeTerms;
  let legal: FakeLegal;

  beforeEach(() => {
    auth = new FakeAuth();
    terms = new FakeTerms();
    legal = new FakeLegal();
    TestBed.configureTestingModule({
      imports: [LegalTerms],
      providers: [
        provideRouter([]),
        { provide: Authenticator, useValue: auth },
        { provide: TermsService, useValue: terms },
        { provide: LegalAcceptanceService, useValue: legal },
      ],
    });
  });

  async function createFixture(): Promise<ComponentFixture<LegalTerms>> {
    const fixture = TestBed.createComponent(LegalTerms);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('calls TermsService.load on init and renders the markdown content', async () => {
    const fixture = await createFixture();
    expect(terms.load).toHaveBeenCalled();
    const article = (fixture.nativeElement as HTMLElement).querySelector('article');
    expect(article).toBeTruthy();
    expect(article?.innerHTML).toContain('<h1>Terminos y Condiciones</h1>');
  });

  it('renders the sticky header with the Volver link', async () => {
    const fixture = await createFixture();
    const back = (fixture.nativeElement as HTMLElement).querySelector('a[href="/"]');
    expect(back).toBeTruthy();
    expect(back?.textContent?.trim()).toBe('Volver');
  });

  it('hides the Aceptar button when no user is logged in', async () => {
    const fixture = await createFixture();
    auth.user.set(null);
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const accept = Array.from(buttons).find((b) => b.textContent?.trim() === 'Aceptar');
    expect(accept).toBeUndefined();
  });

  it('shows the Aceptar button when the user is logged in and needs re-acceptance', async () => {
    const fixture = await createFixture();
    auth.user.set({ uid: 'u1' });
    legal.needsReAcceptance.mockReturnValue(true);
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const accept = Array.from(buttons).find((b) => b.textContent?.trim() === 'Aceptar');
    expect(accept).toBeTruthy();
  });

  it('hides the Aceptar button when the user is logged in but does not need re-acceptance', async () => {
    const fixture = await createFixture();
    auth.user.set({ uid: 'u1' });
    legal.needsReAcceptance.mockReturnValue(false);
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const accept = Array.from(buttons).find((b) => b.textContent?.trim() === 'Aceptar');
    expect(accept).toBeUndefined();
  });

  it('calls legalAcceptance.accept with the user uid and source manual on click', async () => {
    const fixture = await createFixture();
    auth.user.set({ uid: 'u1' });
    legal.needsReAcceptance.mockReturnValue(true);
    fixture.detectChanges();
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((b) => b.textContent?.trim() === 'Aceptar') as HTMLButtonElement | undefined;
    expect(button).toBeTruthy();
    button?.click();
    expect(legal.accept).toHaveBeenCalledWith('u1', 'manual');
  });

  it('renders the raw markdown footer link', async () => {
    const fixture = await createFixture();
    const link = (fixture.nativeElement as HTMLElement).querySelector(
      'a[href="/legal/terms-es.md"]',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('hides the Aceptar button while the firestore read is in flight', async () => {
    auth.user.set({ uid: 'u1' });
    const slowLegal = {
      needsReAcceptance: vi.fn().mockReturnValue(true),
      accept: vi.fn().mockResolvedValue(undefined),
      current: vi.fn().mockReturnValue(new Observable<{ version: string } | null>()),
    };
    TestBed.overrideProvider(LegalAcceptanceService, { useValue: slowLegal });
    legal = slowLegal;
    const fixture = TestBed.createComponent(LegalTerms);
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const accept = Array.from(buttons).find((b) => b.textContent?.trim() === 'Aceptar');
    expect(accept).toBeUndefined();
  });
});
