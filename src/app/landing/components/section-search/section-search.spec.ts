import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, it, expect } from 'vitest';
import { Reveal } from '../../directives/reveal.directive';
import { SectionSearch } from './section-search';

describe('SectionSearch', () => {
  let fixture: ComponentFixture<SectionSearch>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SectionSearch] }).compileComponents();
    fixture = TestBed.createComponent(SectionSearch);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  const search = (value: string) => {
    const input = root.querySelector('#search-demo') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  it('uses "search" as the default section id and states its heading', () => {
    expect(root.querySelector('section')?.id).toBe('search');
    expect(root.querySelector('h2')?.textContent).toContain('Encuentra lo que ya resolviste.');
  });

  it('explains the shortcut and labels the demo as an example', () => {
    const keys = root.querySelector('.whitespace-nowrap');
    expect(keys?.querySelectorAll('kbd.kbd-md').length).toBe(2);
    expect(keys?.closest('p')).toBeNull();
    expect(root.textContent).toContain('Pruébalo con estas tareas de ejemplo.');
  });

  it('marks the record for reveal', () => {
    const revealed = fixture.debugElement
      .queryAll(By.directive(Reveal))
      .map((d) => d.nativeElement as HTMLElement);
    expect(revealed).toContain(root.querySelector('.record') as HTMLElement);
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
    expect((root.querySelector('#search-demo') as HTMLInputElement).value).toBe('');
  });
});
