import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderDone } from './done.template';

describe('renderDone', () => {
  it('returns empty message when no items', () => {
    expect(renderDone([])).toBe('No has completado tareas todavía.');
  });
  it('returns singular for one', () => {
    expect(renderDone([{ title: 'X' } as unknown as IssueI])).toBe('Has completado 1 tarea: X.');
  });
  it('lists up to 5 and adds "y N más"', () => {
    const items = ['A', 'B', 'C', 'D', 'E', 'F'].map((t) => ({ title: t }) as unknown as IssueI);
    expect(renderDone(items)).toBe('Has completado 6 tareas: A, B, C, D, E y 1 más.');
  });
});
