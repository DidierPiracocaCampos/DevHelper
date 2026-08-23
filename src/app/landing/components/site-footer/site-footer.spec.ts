import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SiteFooter } from './site-footer';
import { SOCIAL_LINKS } from '../../data/social-links';
import { TERMS_VERSION } from '../../data/terms-version';

describe('SiteFooter', () => {
  let fixture: ComponentFixture<SiteFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
  });

  it('renders the four column titles', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Producto');
    expect(html).toContain('Legal');
    expect(html).toContain('Comunidad');
    expect(html).toContain('DevHelper');
    expect(fixture.nativeElement.querySelector('.icon')?.textContent?.trim()).toBe('code');
  });

  it('renders four footer columns', () => {
    const cols = fixture.nativeElement.querySelectorAll('.landing-site-footer__col');
    expect(cols).toHaveLength(4);
  });

  it('renders the Producto column links', () => {
    const features = fixture.nativeElement.querySelector('a[href="/#features"]');
    const security = fixture.nativeElement.querySelector('a[href="/#security"]');
    expect(features).toBeTruthy();
    expect(security).toBeTruthy();
  });

  it('renders the Legal column links', () => {
    const terms = fixture.nativeElement.querySelector('a[href="/legal/terms"]');
    const about = fixture.nativeElement.querySelector('a[href="/about"]');
    expect(terms).toBeTruthy();
    expect(about).toBeTruthy();
  });

  it('renders the T&C version line using TERMS_VERSION', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain(`T&C versión ${TERMS_VERSION}`);
  });

  it('renders the Comunidad column links', () => {
    const root = fixture.nativeElement as HTMLElement;
    const github = root.querySelector(`a[href="${SOCIAL_LINKS.github}"]`) as HTMLAnchorElement;
    const instagram = root.querySelector(
      `a[href="${SOCIAL_LINKS.instagram}"]`,
    ) as HTMLAnchorElement;

    expect(github).toBeTruthy();
    expect(github.textContent).toContain('GitHub');
    expect(github.getAttribute('target')).toBe('_blank');
    expect(github.getAttribute('rel')).toBe('noopener noreferrer');
    expect(github.getAttribute('aria-label')).toBe('DevHelper en GitHub');
    expect(github.querySelector('img[src="/icons/github.svg"]')).toBeTruthy();

    expect(instagram).toBeTruthy();
    expect(instagram.textContent).toContain('Instagram');
    expect(instagram.getAttribute('target')).toBe('_blank');
    expect(instagram.getAttribute('rel')).toBe('noopener noreferrer');
    expect(instagram.getAttribute('aria-label')).toBe('DevHelper en Instagram');
    expect(instagram.querySelector('img[src="/icons/instagram.svg"]')).toBeTruthy();
  });

  it('marks social icons as decorative', () => {
    const imgs = fixture.nativeElement.querySelectorAll(
      'a[target="_blank"] img',
    ) as NodeListOf<HTMLImageElement>;
    expect(imgs.length).toBe(2);
    for (const img of imgs) {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
