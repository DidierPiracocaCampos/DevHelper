import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ObsidianPage } from './obsidian';
import { Authenticator } from '../../../shared/service/authenticator';
import { SeoService } from '../../services/seo.service';
import { OBSIDIAN_LINKS } from '../../data/obsidian-links';

class FakeAuth {
  readonly user = signal<{ uid: string } | null>(null);
  readonly isLoggedIn = computed(() => !!this.user());
  logout = (() => Promise.resolve()) as unknown as Authenticator['logout'];
}

describe('ObsidianPage', () => {
  let fixture: ComponentFixture<ObsidianPage>;
  let auth: FakeAuth;
  let seoSet: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    auth = new FakeAuth();
    await TestBed.configureTestingModule({
      imports: [ObsidianPage],
      providers: [provideRouter([]), { provide: Authenticator, useValue: auth }],
    }).compileComponents();

    seoSet = vi.spyOn(TestBed.inject(SeoService), 'set');
    fixture = TestBed.createComponent(ObsidianPage);
    fixture.detectChanges();
  });

  const root = () => fixture.nativeElement as HTMLElement;

  it('says what the plugin is in the H1', () => {
    expect(root().querySelector('h1')?.textContent).toContain('Obsidian');
    expect(root().querySelector('#inicio p')?.textContent).toContain('registra tus avances');
  });

  it('makes the store the primary CTA', () => {
    const first = root().querySelector('#inicio a') as HTMLAnchorElement;
    expect(first.getAttribute('href')).toBe(OBSIDIAN_LINKS.pluginStore);
    expect(first.getAttribute('target')).toBe('_blank');
    expect(first.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('offers the deep link without target', () => {
    expect(root().querySelector(`a[href="${OBSIDIAN_LINKS.pluginDeepLink}"]`)).toBeTruthy();
    const deepLinks = Array.from(root().querySelectorAll('a[href^="obsidian://"]'));
    for (const link of deepLinks) {
      expect(link.hasAttribute('target')).toBe(false);
    }
  });

  it('sets SEO for /obsidian', () => {
    expect(seoSet).toHaveBeenCalledWith(expect.objectContaining({ path: '/obsidian' }));
  });

  it('shows the logged-in header', () => {
    auth.user.set({ uid: 'u' });
    fixture.detectChanges();
    expect(root().textContent).not.toContain('Crear cuenta');
  });
});
