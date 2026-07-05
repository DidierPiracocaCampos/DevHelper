import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderPending } from './pending.template';

describe('renderPending', () => {
  it('returns empty message when no items', () => {
    expect(renderPending([])).toBe('No tienes tareas pendientes.');
  });

  it('returns singular for one item', () => {
    expect(renderPending([{ title: 'Hacer X' } as unknown as IssueI])).toBe(
      'Tienes 1 tarea pendiente: Hacer X.',
    );
  });

  it('lists up to 5 items', () => {
    const items = ['A', 'B', 'C', 'D', 'E'].map((title) => ({ title }) as unknown as IssueI);
    expect(renderPending(items)).toBe('Tienes 5 tareas pendientes: A, B, C, D, E.');
  });

  it('truncates with "y N más" when more than 5', () => {
    const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(
      (title) => ({ title }) as unknown as IssueI,
    );
    expect(renderPending(items)).toBe('Tienes 7 tareas pendientes: A, B, C, D, E y 2 más.');
  });
});
