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

  it('states that files are encrypted before upload', () => {
    const text = (root.querySelector('#feature-files')?.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('Hasta 5 MB por archivo, cifrados antes de subir.');
  });

  it('promises dates in a calendar, not reminders', () => {
    const text = (root.querySelector('#feature-events')?.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('Fechas y compromisos en un calendario global');
    expect(text).not.toContain('recordatorios');
  });

  it('uses the landing crops, with sized mobile variants', () => {
    const images = Array.from(root.querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(images).toEqual([
      '/img/landing/tareas.webp',
      '/img/landing/tarea-detalle.webp',
      '/img/landing/archivos.webp',
      '/img/landing/contrasenas.webp',
    ]);
    const sources = Array.from(root.querySelectorAll('picture source'));
    expect(sources.map((s) => s.getAttribute('srcset'))).toEqual([
      '/img/landing/tareas-movil.webp',
      '/img/landing/tarea-detalle-movil.webp',
      '/img/landing/archivos-movil.webp',
    ]);
    for (const source of sources) {
      expect(source.getAttribute('width')).toBeTruthy();
      expect(source.getAttribute('height')).toBeTruthy();
    }
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
