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

  it('renders the site header and the site footer', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('landing-site-header')).toBeTruthy();
    expect(html.querySelector('landing-site-footer')).toBeTruthy();
  });

  it('renders all sections in order', () => {
    const root = fixture.nativeElement as HTMLElement;
    const order = ['hero', 'capabilities', 'features', 'search', 'security', 'stack', 'cta'].map(
      (name) => root.querySelector('landing-section-' + name),
    );
    order.forEach((el) => expect(el).toBeTruthy());
    for (let i = 1; i < order.length; i++) {
      expect(order[i]!.previousElementSibling).toBe(order[i - 1]);
    }
  });

  it('keeps the header navigation pointing at the landing anchors', () => {
    const root = fixture.nativeElement as HTMLElement;
    for (const href of ['/#features', '/#security']) {
      expect(root.querySelector('landing-site-header a[href="' + href + '"]')).toBeTruthy();
    }
    expect(root.querySelector('#search')).toBeTruthy();
  });
});
