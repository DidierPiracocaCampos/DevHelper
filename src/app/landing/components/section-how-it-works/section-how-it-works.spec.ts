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
    expect(headings[0].textContent).toContain('Crea cuenta');
    expect(headings[1].textContent).toContain('Configura tu vault');
    expect(headings[2].textContent).toContain('Empieza a guardar');
    const links = root.querySelectorAll('a');
    expect(links.length).toBeGreaterThanOrEqual(3);
  });
});
