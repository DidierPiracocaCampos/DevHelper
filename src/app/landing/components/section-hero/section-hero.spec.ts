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

  const search = (value: string) => {
    const input = root.querySelector('#hero-search') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

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

  it('shows the CORS example by default and labels it as an example', () => {
    expect(root.querySelector('[data-task="cors"]')).toBeTruthy();
    expect(root.querySelector('.task__meta')?.textContent).toContain('Tarea de ejemplo');
  });

  it('marks the attachments of the example as encrypted', () => {
    const items = root.querySelectorAll('.task__attachment');
    expect(items.length).toBe(3);
    for (const item of items) {
      expect(item.textContent).toContain('cifrad');
    }
  });

  it('finds an example by typing, ignoring accents and case', () => {
    search('MIGRACION');
    expect(root.querySelector('[data-task="migracion"]')).toBeTruthy();
    expect(root.querySelector('[data-task="cors"]')).toBeNull();
  });

  it('finds an example through the suggested terms and reflects the pressed state', () => {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.record__term'));
    const term = buttons.find((button) => button.textContent?.trim() === 'certificado');
    term?.click();
    fixture.detectChanges();
    expect(root.querySelector('[data-task="certificado"]')).toBeTruthy();
    expect(term?.getAttribute('aria-pressed')).toBe('true');
  });

  it('announces the result to assistive technology', () => {
    search('certificado');
    expect(root.querySelector('[role="status"]')?.textContent).toContain(
      'La renovación del certificado devuelve 404',
    );
  });

  it('shows an empty state with a way back when nothing matches', () => {
    search('kubernetes');
    expect(root.querySelector('.task')).toBeNull();
    expect(root.querySelector('.record__empty')?.textContent).toContain('kubernetes');
    (root.querySelector('.record__empty button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(root.querySelector('[data-task="cors"]')).toBeTruthy();
    expect((root.querySelector('#hero-search') as HTMLInputElement).value).toBe('');
  });
});
