import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionHero } from './section-hero';

describe('SectionHero', () => {
  let fixture: ComponentFixture<SectionHero>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHero],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHero);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('states the promise and names the product', () => {
    const h1 = root.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim();
    expect(h1).toBe('Registra lo que resuelves. Encuéntralo cuando vuelva.');
    expect(root.textContent).toContain('DevHelper es una app para registrar tus avances');
  });

  it('renders the primary and secondary CTAs with their target routes', () => {
    const primary = root.querySelector('a[href="/login/register"].btn-primary');
    const secondary = root.querySelector('a[href="/#features"].btn-ghost');
    expect(primary?.textContent?.trim()).toBe('Crear cuenta');
    expect(secondary?.textContent?.trim()).toBe('Ver funciones');
    expect(secondary?.classList).not.toContain('hidden');
  });

  it('renders the product window with real dimensions and a descriptive alt', () => {
    const img = root.querySelector('figure .product-window img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/img/landing/producto-escritorio.webp');
    expect(img.getAttribute('width')).toBe('2880');
    expect(img.getAttribute('height')).toBe('1840');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('alt')).toContain('datos de ejemplo');
    const source = root.querySelector('picture source');
    expect(source?.getAttribute('srcset')).toBe('/img/landing/producto-movil.webp');
    expect(source?.getAttribute('width')).toBe('780');
    expect(source?.getAttribute('height')).toBe('1688');
  });

  it('captions the figure outside the window', () => {
    expect(root.querySelector('figure figcaption')?.textContent).toContain('datos de ejemplo');
    expect(root.querySelector('.product-window figcaption')).toBeNull();
  });

  it('avoids daisyUI component class names on its root', () => {
    expect(root.querySelector('section')?.classList).not.toContain('hero');
  });
});
