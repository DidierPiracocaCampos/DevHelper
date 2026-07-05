import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderOverdue } from './overdue.template';

describe('renderOverdue', () => {
  it('returns empty when no overdue', () => {
    expect(renderOverdue([])).toBe('No tienes tareas vencidas. Bien hecho.');
  });
  it('returns singular with date', () => {
    const items = [{ title: 'X', dueAt: new Date('2026-01-01') } as unknown as IssueI];
    expect(renderOverdue(items)).toBe('Tienes 1 tarea vencida: X (vencía el 1/1/2026).');
  });
  it('returns plural listing up to 5', () => {
    const items = Array.from(
      { length: 3 },
      (_, i) =>
        ({
          title: `T${i}`,
          dueAt: new Date('2026-01-01'),
        }) as unknown as IssueI,
    );
    expect(renderOverdue(items)).toBe('Tienes 3 tareas vencidas: T0, T1, T2.');
  });
});
