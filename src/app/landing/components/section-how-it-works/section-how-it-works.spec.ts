import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { SectionHowItWorks } from './section-how-it-works';

describe('SectionHowItWorks', () => {
  it('renders 3 steps with titles, descriptions and links', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SectionHowItWorks);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const headings = root.querySelectorAll('h3');
    expect(headings.length).toBe(3);
    expect(root.querySelector('h2')?.textContent).toContain(
      'Empieza en minutos. Conserva el contexto durante años.',
    );
    expect(headings[0].textContent).toContain('Crea tu cuenta');
    expect(headings[1].textContent).toContain('Cierra tu vault');
    expect(headings[2].textContent).toContain('Guarda y recupera');
    expect(root.textContent).not.toContain('Sin verificación obligatoria');
    const links = root.querySelectorAll('a');
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(root.querySelector('a[href="/#security"]')).toBeTruthy();
  });

  it('marks step icons as decorative', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SectionHowItWorks);
    fixture.detectChanges();
    const icons = fixture.nativeElement.querySelectorAll('.grid .icon');

    expect(icons.length).toBe(3);
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
