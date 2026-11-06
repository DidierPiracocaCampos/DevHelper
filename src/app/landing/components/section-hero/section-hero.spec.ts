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
    expect(root.querySelector('h1')?.textContent).toContain('Este error ya lo resolviste.');
    expect(root.textContent).toContain('DevHelper es una app para registrar tus avances');
    expect(root.querySelector('.hero__shot img')?.getAttribute('alt')).toContain('DevHelper');
  });

  it('renders the primary and secondary CTAs with their target routes', () => {
    const primary = root.querySelector('a[href="/login/register"].btn-primary');
    const secondary = root.querySelector('a[href="/#how-it-works"].btn-ghost');
    expect(primary?.textContent?.trim()).toBe('Crear mi workspace');
    expect(secondary?.textContent?.trim()).toBe('Ver cómo funciona');
  });

  it('avoids daisyUI component class names on its root', () => {
    expect(root.querySelector('section')?.classList).not.toContain('hero');
  });
});
