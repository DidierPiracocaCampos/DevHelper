import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionCapabilities } from './section-capabilities';

describe('SectionCapabilities', () => {
  let fixture: ComponentFixture<SectionCapabilities>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCapabilities],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SectionCapabilities);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('links to each capability in order', () => {
    const links = Array.from(root.querySelectorAll('a'));
    expect(links.map((a) => a.querySelector('span:not(.icon)')?.textContent?.trim())).toEqual([
      'Proyectos y tareas',
      'Tus avances',
      'Buscador',
      'Archivos',
      'Contraseñas',
      'Eventos',
      'IA local',
    ]);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/#feature-tasks',
      '/#feature-progress',
      '/#search',
      '/#feature-files',
      '/#feature-passwords',
      '/#feature-events',
      '/#feature-ai',
    ]);
  });

  it('caps the reveal delay at 240 ms', () => {
    const cmp = fixture.componentInstance as unknown as { delay(i: number): number };
    expect(cmp.delay(0)).toBe(0);
    expect(cmp.delay(3)).toBe(120);
    expect(cmp.delay(6)).toBe(240);
    expect(cmp.delay(9)).toBe(240);
  });
});
