import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionHero } from './section-hero';

describe('SectionHero', () => {
  let fixture: ComponentFixture<SectionHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHero],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHero);
    fixture.detectChanges();
  });

  it('renders the hero heading', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('WORKSPACE TÉCNICO · CIFRADO EN CLIENTE');
    expect(html).toContain('Tu memoria técnica, organizada y protegida.');
    expect(html).toContain('proyectos');
    expect(html).toContain('tareas');
    expect(html).toContain('credenciales');
    expect(html).toContain('archivos');
    expect(html).toContain('eventos');
    expect(html).toContain('IA local');
  });

  it('uses monochrome outlined badges', () => {
    const badges = fixture.nativeElement.querySelectorAll('.badge');
    const colorVariants = [
      'badge-primary',
      'badge-secondary',
      'badge-accent',
      'badge-neutral',
      'badge-success',
      'badge-info',
      'badge-warning',
      'badge-error',
    ];

    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) {
      expect((badge as HTMLElement).classList).toContain('badge-outline');
      for (const variant of colorVariants) {
        expect((badge as HTMLElement).classList).not.toContain(variant);
      }
    }
  });

  it('marks the hero icon as decorative', () => {
    const icon = fixture.nativeElement.querySelector('.hero-reveal--1 .icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the primary and secondary CTAs with their target routes', () => {
    const primary = fixture.nativeElement.querySelector(
      'a[href="/login/register"].btn-primary',
    ) as HTMLAnchorElement;
    const secondary = fixture.nativeElement.querySelector(
      'a[href="/#how-it-works"].btn-ghost',
    ) as HTMLAnchorElement;
    expect(primary?.textContent?.trim()).toBe('Crear mi workspace');
    expect(secondary?.textContent?.trim()).toBe('Ver cómo funciona');
  });

  it('renders the hero screenshot with src and alt', () => {
    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img') as HTMLImageElement;
    expect(img?.getAttribute('src')).toBe('/img/landing/hero-home.webp');
    expect(img?.getAttribute('alt')).toBe('DevHelper dashboard en uso real');
    expect(img?.getAttribute('width')).toBe('1280');
    expect(img?.getAttribute('height')).toBe('800');
  });

  it('wraps the hero image in a mockup-browser frame', () => {
    const root = fixture.nativeElement as HTMLElement;
    const mockup = root.querySelector('.mockup-browser');
    const img = mockup?.querySelector('img') as HTMLImageElement;
    expect(mockup).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/img/landing/hero-home.webp');
  });

  it('renders the hero mockup in the DOM', () => {
    const root = fixture.nativeElement as HTMLElement;
    const visual = root.querySelector('.hero-reveal--5');
    expect(visual?.querySelector('.mockup-browser img')).toBeTruthy();
  });

  it('separates the floating wrapper from the hover visual', () => {
    const root = fixture.nativeElement as HTMLElement;
    const floatWrapper = root.querySelector('.section-hero__visual-float');
    const visual = floatWrapper?.querySelector(':scope > .section-hero__visual');

    expect(floatWrapper).toBeTruthy();
    expect(visual).toBeTruthy();
    expect(floatWrapper).not.toBe(visual);
    expect(root.querySelectorAll('.section-hero__visual')).toHaveLength(1);
  });

  it('tags hero blocks with staggered reveal classes', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.hero-reveal--1')).toBeTruthy();
    expect(root.querySelector('.hero-reveal--5')).toBeTruthy();
  });
});
