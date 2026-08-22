import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionCta } from './section-cta';

describe('SectionCta', () => {
  let fixture: ComponentFixture<SectionCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionCta);
    fixture.detectChanges();
  });

  it('renders the CTA heading', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Deja de reconstruir el mismo contexto.');
    expect(html).toContain(
      'Centraliza tu memoria técnica en un workspace privado y vuelve a encontrarla cuando la necesites.',
    );
    expect(fixture.nativeElement.querySelector('a[href="/login/register"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/login"]')).toBeTruthy();
  });

  it('renders the CTA surface and motion hooks on both buttons', () => {
    const root = fixture.nativeElement as HTMLElement;
    const surface = root.querySelector('.section-cta__surface');
    const primary = root.querySelector('a[href="/login/register"]');
    const secondary = root.querySelector('a[href="/login"]');

    expect(surface).toBeTruthy();
    expect(surface?.classList).toContain('bg-base-200');
    expect(surface?.classList).toContain('border');
    expect(surface?.classList).toContain('border-base-300');
    expect(surface?.classList).toContain('rounded-box');
    expect(primary?.classList).toContain('section-cta__button-primary');
    expect(secondary?.classList).toContain('section-cta__button-secondary');
  });
});
