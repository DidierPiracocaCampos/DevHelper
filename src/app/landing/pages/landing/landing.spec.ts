import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { Landing } from './landing';
import { Authenticator } from '../../../shared/service/authenticator';

class FakeAuth {
  readonly user = signal<{ uid: string } | null>(null);
  readonly isLoggedIn = computed(() => !!this.user());
  logout = (() => Promise.resolve()) as unknown as Authenticator['logout'];
}

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([]), { provide: Authenticator, useValue: new FakeAuth() }],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
  });

  it('renders the site header, the four sections and the site footer', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('landing-site-header')).toBeTruthy();
    expect(html.querySelector('landing-section-hero')).toBeTruthy();
    expect(html.querySelector('landing-section-features')).toBeTruthy();
    expect(html.querySelector('landing-section-security')).toBeTruthy();
    expect(html.querySelector('landing-section-cta')).toBeTruthy();
    expect(html.querySelector('landing-site-footer')).toBeTruthy();
  });

  it('renders all 6 sections in order', () => {
    const root = fixture.nativeElement as HTMLElement;
    const hero = root.querySelector('landing-section-hero');
    const features = root.querySelector('landing-section-features');
    const howItWorks = root.querySelector('landing-section-how-it-works');
    const security = root.querySelector('landing-section-security');
    const stack = root.querySelector('landing-section-stack');
    const cta = root.querySelector('landing-section-cta');
    expect(hero).toBeTruthy();
    expect(features).toBeTruthy();
    expect(howItWorks).toBeTruthy();
    expect(security).toBeTruthy();
    expect(stack).toBeTruthy();
    expect(cta).toBeTruthy();
    expect(features!.previousElementSibling).toBe(hero);
    expect(howItWorks!.previousElementSibling).toBe(features);
    expect(security!.previousElementSibling).toBe(howItWorks);
    expect(stack!.previousElementSibling).toBe(security);
    expect(cta!.previousElementSibling).toBe(stack);
  });

  it('exposes the anchor destinations used by the landing navigation', () => {
    const root = fixture.nativeElement as HTMLElement;
    const anchors = [
      ['features', '/#features'],
      ['how-it-works', '/#how-it-works'],
      ['security', '/#security'],
    ] as const;

    for (const [id, href] of anchors) {
      expect(root.querySelector(`#${id}`)).toBeTruthy();
      expect(root.querySelector(`a[href="${href}"]`)).toBeTruthy();
    }
  });
});
