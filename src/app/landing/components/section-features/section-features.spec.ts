import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionFeatures } from './section-features';

describe('SectionFeatures', () => {
  let fixture: ComponentFixture<SectionFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFeatures],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionFeatures);
    fixture.detectChanges();
  });

  it('renders the section heading', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Todo lo que necesitas en un solo lugar');
  });

  it('uses the default id "features" for the anchor', () => {
    const section = fixture.nativeElement.querySelector('section#features');
    expect(section).toBeTruthy();
  });

  it('accepts a custom id input and applies it to the section', () => {
    fixture.componentRef.setInput('id', 'my-features');
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section#my-features');
    expect(section).toBeTruthy();
    const old = fixture.nativeElement.querySelector('section#features');
    expect(old).toBeNull();
  });

  it('renders the six feature cards in the correct order', () => {
    const titles = Array.from(fixture.nativeElement.querySelectorAll('.card h3')) as HTMLElement[];
    expect(titles.map((t) => t.textContent?.trim())).toEqual([
      'Vault cifrado',
      'Proyectos',
      'Tareas y notas',
      'Contraseñas',
      'Eventos',
      'IA local opcional',
    ]);
  });

  it('renders a card for each feature entry with its icon', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card');
    expect(cards.length).toBe(6);
    const icons = Array.from(
      fixture.nativeElement.querySelectorAll('.card .icon'),
    ) as HTMLElement[];
    expect(icons.map((i) => i.textContent?.trim())).toEqual([
      'lock',
      'folder_open',
      'task_alt',
      'key',
      'event',
      'memory',
    ]);
  });
});
