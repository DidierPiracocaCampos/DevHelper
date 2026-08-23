import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { About } from './about';
import { Authenticator } from '../../../shared/service/authenticator';

class FakeAuth {
  readonly user = signal<{ uid: string } | null>(null);
  readonly isLoggedIn = computed(() => !!this.user());
  logout = (() => Promise.resolve()) as unknown as Authenticator['logout'];
}

describe('About', () => {
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([]), { provide: Authenticator, useValue: new FakeAuth() }],
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    fixture.detectChanges();
  });

  it('renders the H1 and the main text', () => {
    const html = fixture.nativeElement as HTMLElement;
    const h1 = html.querySelector('h1');
    expect(h1?.textContent).toContain('Acerca de');
    expect(h1?.textContent).toContain('DevHelper');
    expect(h1?.querySelector('.icon')?.textContent?.trim()).toBe('code');
    const text = html.textContent ?? '';
    expect(text).toContain('workspace personal cifrado para developers');
    expect(text).toContain('Principios');
    expect(text).toContain('Cifrado en cliente');
  });
});
