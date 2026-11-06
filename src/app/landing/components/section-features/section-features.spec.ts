import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionFeatures } from './section-features';

describe('SectionFeatures', () => {
  let fixture: ComponentFixture<SectionFeatures>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFeatures],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionFeatures);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('renders the section heading', () => {
    expect(root.querySelector('h2')?.textContent).toContain(
      'Todo lo que necesitaste, en la tarea donde lo necesitaste.',
    );
  });

  it('renders one row per capability, in order', () => {
    const rows = Array.from(root.querySelectorAll('[data-feature]'));
    expect(rows.map((row) => row.querySelector('h3')?.textContent?.trim())).toEqual([
      'Proyectos y tareas',
      'Buscador',
      'Archivos',
      'Contraseñas',
      'Eventos',
      'IA local',
    ]);
  });

  it('gives every row an example', () => {
    for (const row of root.querySelectorAll('[data-feature]')) {
      expect(row.querySelector('.demo')).toBeTruthy();
    }
  });

  it('labels the data as an example', () => {
    expect(root.textContent).toContain('Los datos que ves en esta página son de ejemplo.');
  });

  it('marks icons as decorative', () => {
    const icons = root.querySelectorAll('.icon');
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
