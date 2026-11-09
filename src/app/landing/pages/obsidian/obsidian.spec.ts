import { ViewportScroller } from '@angular/common';
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
  let setOffset: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    auth = new FakeAuth();
    await TestBed.configureTestingModule({
      imports: [ObsidianPage],
      providers: [provideRouter([]), { provide: Authenticator, useValue: auth }],
    }).compileComponents();

    seoSet = vi.spyOn(TestBed.inject(SeoService), 'set');
    setOffset = vi.spyOn(TestBed.inject(ViewportScroller), 'setOffset');
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

  it('scrolls fragment links clear of the fixed header', () => {
    expect(setOffset).toHaveBeenCalledWith([0, 88]);
  });

  it('sets SEO for /obsidian', () => {
    expect(seoSet).toHaveBeenCalledWith(expect.objectContaining({ path: '/obsidian' }));
  });

  it('lists the six plugin capabilities', () => {
    const titles = Array.from(root().querySelectorAll('#plugin h3')).map((h) =>
      h.textContent?.trim(),
    );
    expect(titles).toEqual([
      'Proyectos y tareas',
      'Notas',
      'Archivos y proyecto General',
      'Credenciales cifradas',
      'Calendario mensual',
      'Botones de la barra',
    ]);
  });

  it('links the theme to the store', () => {
    const theme = root().querySelector('#theme') as HTMLElement;
    const store = theme.querySelector(`a[href="${OBSIDIAN_LINKS.themeStore}"]`);
    expect(store?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(theme.querySelector(`a[href="${OBSIDIAN_LINKS.themeDeepLink}"]`)).toBeTruthy();
  });

  it('offers the skills zip', () => {
    const skills = root().querySelector('#skills') as HTMLElement;
    expect(skills.querySelector(`a[href="${OBSIDIAN_LINKS.skillsZip}"]`)).toBeTruthy();
    expect(skills.textContent).toContain('.claude/skills/');
  });

  it('states exactly what is encrypted', () => {
    const text = root().querySelector('#credenciales')?.textContent ?? '';
    for (const word of ['user', 'password', 'url', 'notes', 'service', 'AES-GCM']) {
      expect(text).toContain(word);
    }
    expect(text).toContain('no se puede recuperar');
  });

  it('anchors every doc section below the header', () => {
    for (const id of [
      'instalacion',
      'primeros-pasos',
      'skills',
      'credenciales',
      'botones',
      'faq',
    ]) {
      const el = root().querySelector(`#${id}`) as HTMLElement;
      expect(el.tagName).toBe('SECTION');
      expect(el.closest('main')).toBeTruthy();
    }
  });

  it('lets long paths wrap', () => {
    const codes = Array.from(root().querySelectorAll('#docs code'));
    expect(codes.length).toBeGreaterThan(0);
    for (const code of codes) {
      expect(code.classList).toContain('obsidian-path');
    }
  });

  it('has a docs index pointing to each section', () => {
    const hrefs = Array.from(root().querySelectorAll('.docs-index a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual([
      '/obsidian#instalacion',
      '/obsidian#primeros-pasos',
      '/obsidian#skills',
      '/obsidian#credenciales',
      '/obsidian#botones',
      '/obsidian#faq',
    ]);
  });

  it('answers three FAQs', () => {
    expect(root().querySelectorAll('#faq details').length).toBe(3);
  });

  it('shows the theme with descriptive alt text', () => {
    const img = root().querySelector('#theme img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/img/obsidian/theme.webp');
    expect(img.getAttribute('alt')?.length).toBeGreaterThan(20);
  });

  it('shows the logged-in header', () => {
    auth.user.set({ uid: 'u' });
    fixture.detectChanges();
    expect(root().textContent).not.toContain('Crear cuenta');
  });
});
