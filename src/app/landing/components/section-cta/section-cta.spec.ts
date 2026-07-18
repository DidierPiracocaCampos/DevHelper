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
    expect(html).toContain('¿Listo para centralizar tu memoria técnica?');
  });

  it('renders the Crear cuenta CTA pointing to /login/register', () => {
    const cta = fixture.nativeElement.querySelector(
      'a[href="/login/register"].btn-primary',
    ) as HTMLAnchorElement;
    expect(cta).toBeTruthy();
    expect(cta.textContent?.trim()).toBe('Crear cuenta');
  });

  it('renders the Inicia sesión CTA pointing to /login', () => {
    const cta = fixture.nativeElement.querySelector(
      'a[href="/login"].btn-ghost',
    ) as HTMLAnchorElement;
    expect(cta).toBeTruthy();
    expect(cta.textContent?.trim()).toBe('¿Ya tienes cuenta? Inicia sesión');
  });
});
