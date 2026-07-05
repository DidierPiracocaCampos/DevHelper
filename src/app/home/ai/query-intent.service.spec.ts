import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { QueryIntentService } from './query-intent.service';

describe('QueryIntentService', () => {
  let service: QueryIntentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [QueryIntentService] });
    service = TestBed.inject(QueryIntentService);
  });

  it('classifies pending tasks', () => {
    expect(service.classify('qué tareas tengo pendientes').intent).toBe('list_pending');
    expect(service.classify('que falta por hacer').intent).toBe('list_pending');
    expect(service.classify('tareas no hechas').intent).toBe('list_pending');
    expect(service.classify('qué me queda').intent).toBe('list_pending');
  });

  it('classifies done tasks', () => {
    expect(service.classify('qué tareas hice').intent).toBe('list_done');
    expect(service.classify('terminadas').intent).toBe('list_done');
    expect(service.classify('completadas').intent).toBe('list_done');
  });

  it('classifies projects list', () => {
    expect(service.classify('lista de proyectos').intent).toBe('list_projects');
    expect(service.classify('qué proyectos tengo').intent).toBe('list_projects');
    expect(service.classify('mis proyectos').intent).toBe('list_projects');
  });

  it('classifies overdue', () => {
    expect(service.classify('tareas vencidas').intent).toBe('overdue');
    expect(service.classify('atrasadas').intent).toBe('overdue');
    expect(service.classify('qué está tarde').intent).toBe('overdue');
  });

  it('classifies today', () => {
    expect(service.classify('qué hay para hoy').intent).toBe('today');
    expect(service.classify('cosas de hoy').intent).toBe('today');
  });

  it('classifies this week', () => {
    expect(service.classify('esta semana').intent).toBe('this_week');
    expect(service.classify('la semana que viene').intent).toBe('this_week');
  });

  it('classifies by project and extracts entity', () => {
    const r = service.classify('tareas del proyecto DevHelper');
    expect(r.intent).toBe('by_project');
    expect(r.entity).toBe('DevHelper');
  });

  it('classifies by tag and extracts entity', () => {
    const r = service.classify('tareas con tag urgente');
    expect(r.intent).toBe('by_tag');
    expect(r.entity).toBe('urgente');
  });

  it('classifies summary', () => {
    expect(service.classify('resume el proyecto X').intent).toBe('summary');
    expect(service.classify('resumen').intent).toBe('summary');
  });

  it('falls back to search for unrecognized text', () => {
    const r = service.classify('el error de la api de stripe la semana pasada');
    expect(r.intent).toBe('search');
  });

  it('returns unknown for empty input', () => {
    expect(service.classify('').intent).toBe('unknown');
  });
});
