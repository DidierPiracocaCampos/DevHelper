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
    expect(html).toContain('Tu memoria técnica cifrada, en un solo lugar');
  });

  it('renders the hero subtitle', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Cifrado en tu dispositivo');
    expect(html).toContain('Sin backdoor del servidor');
  });

  it('renders the Crear cuenta CTA pointing to /login/register', () => {
    const cta = fixture.nativeElement.querySelector(
      'a[href="/login/register"].btn-primary',
    ) as HTMLAnchorElement;
    expect(cta).toBeTruthy();
    expect(cta.textContent?.trim()).toBe('Crear cuenta');
  });

  it('renders the Ya tengo cuenta CTA pointing to /login', () => {
    const cta = fixture.nativeElement.querySelector(
      'a[href="/login"].btn-ghost',
    ) as HTMLAnchorElement;
    expect(cta).toBeTruthy();
    expect(cta.textContent?.trim()).toBe('Ya tengo cuenta');
  });
});
