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
});
