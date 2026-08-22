import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { SectionStack } from './section-stack';

describe('SectionStack', () => {
  it('renders a single marquee row', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(SectionStack);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.section-stack__row').length).toBe(1);
    expect(root.querySelectorAll('.section-stack__row--reverse').length).toBe(0);
  });

  it('lists 4 unique tech names for screen readers', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(SectionStack);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const names = [...root.querySelectorAll('.sr-only li')].map((el) => el.textContent?.trim());
    expect(names).toHaveLength(4);
    expect(names?.some((n) => n?.includes('Angular 20'))).toBe(true);
    expect(names?.some((n) => n?.includes('DaisyUI 5'))).toBe(true);
    expect(names?.some((n) => n?.includes('Tailwind 4'))).toBe(true);
    expect(names?.some((n) => n?.includes('Firebase'))).toBe(true);
  });

  it('renders chips with stack SVG logos and no daisyUI badges', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(SectionStack);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const primaryChips = root.querySelectorAll(
      '.section-stack__track[data-stack-track="0"] .section-stack__chip',
    );
    // 4 unique chips × densify 3 = 12 chips per primary track
    expect(primaryChips.length).toBe(12);
    const logos = root.querySelectorAll(
      '.section-stack__track[data-stack-track="0"] .section-stack__logo',
    );
    expect(logos.length).toBe(12);
    expect((logos[0] as HTMLImageElement).getAttribute('src')).toContain('/icons/stack/');
    expect(root.querySelectorAll('.badge').length).toBe(0);
  });

  it('renders the section header copy', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(SectionStack);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h2')?.textContent).toContain('Stack técnico transparente');
  });
});
