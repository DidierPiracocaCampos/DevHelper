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
    expect(html).toContain('Tu memoria técnica cifrada, en un solo lugar.');
  });

  it('renders the primary and secondary CTAs with their target routes', () => {
    const html = fixture.nativeElement.textContent as string;
    const primary = fixture.nativeElement.querySelector(
      'a[href="/login/register"].btn-primary',
    ) as HTMLAnchorElement;
    const secondary = fixture.nativeElement.querySelector(
      'a[href="/login"].btn-ghost',
    ) as HTMLAnchorElement;
    expect(primary?.textContent?.trim()).toBe('Crear cuenta');
    expect(secondary?.textContent?.trim()).toBe('Ya tengo cuenta');
    expect(html).toContain('Cifrado en tu dispositivo');
  });

  it('renders the hero screenshot with src and alt', () => {
    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img') as HTMLImageElement;
    expect(img?.getAttribute('src')).toBe('/img/landing/hero-home.png');
    expect(img?.getAttribute('alt')).toBe('DevHelper dashboard en uso real');
    expect(img?.getAttribute('width')).toBe('1280');
    expect(img?.getAttribute('height')).toBe('800');
  });
});
