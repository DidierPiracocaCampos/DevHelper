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

  it('renders the section heading and id', () => {
    expect(root.querySelector('h2')?.textContent).toContain(
      'Todo tu trabajo técnico, en un solo lugar.',
    );
    expect(root.querySelector('section')?.id).toBe('features');
  });

  it('renders the six feature articles with their anchors, in order', () => {
    const articles = Array.from(root.querySelectorAll('article[id]'));
    expect(articles.map((a) => a.id)).toEqual([
      'feature-tasks',
      'feature-progress',
      'feature-files',
      'feature-passwords',
      'feature-events',
      'feature-ai',
    ]);
    expect(articles.map((a) => a.querySelector('h3')?.textContent?.trim())).toEqual([
      'Proyectos y tareas',
      'Tus avances',
      'Archivos',
      'Contraseñas',
      'Eventos',
      'IA local',
    ]);
  });

  it('presents file encryption as optional', () => {
    const text = root.querySelector('#feature-files')?.textContent ?? '';
    expect(text).toContain('con la opción de cifrarlos antes de subir');
  });

  it('shows the real app in four images with real size and descriptive alt', () => {
    const images = Array.from(root.querySelectorAll('img'));
    expect(images.length).toBe(4);
    for (const image of images) {
      expect(image.getAttribute('alt')?.length).toBeGreaterThan(20);
      expect(image.getAttribute('loading')).toBe('lazy');
      expect(image.getAttribute('decoding')).toBe('async');
      expect(image.getAttribute('width')).toBeTruthy();
      expect(image.getAttribute('height')).toBeTruthy();
    }
  });

  it('hides overlay scenes from assistive tech', () => {
    const scenes = root.querySelectorAll('.scene');
    expect(scenes.length).toBe(2);
    for (const scene of scenes) {
      expect(scene.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('renders events as a real list and the AI exchange as real text', () => {
    const list = root.querySelector('ul[aria-label="Ejemplo de eventos"]');
    expect(list?.querySelectorAll('li').length).toBe(2);
    const ai = root.querySelector('#feature-ai')?.textContent ?? '';
    expect(ai).toContain('¿Qué tengo esta semana?');
    expect(ai).toContain('Tienes 1 tarea esta semana: Migrar a Postgres 16.');
  });

  it('labels the data as an example', () => {
    expect(root.textContent).toContain('Los datos que ves en esta página son de ejemplo.');
  });

  it('marks icons as decorative', () => {
    const icons = root.querySelectorAll('.icon');
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      const hidden =
        icon.getAttribute('aria-hidden') === 'true' || !!icon.closest('[aria-hidden="true"]');
      expect(hidden).toBe(true);
    }
  });
});
