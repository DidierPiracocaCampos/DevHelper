import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderWeek } from './week.template';

describe('renderWeek', () => {
  it('empty', () => {
    expect(renderWeek([])).toBe('No tienes tareas para esta semana.');
  });
  it('one', () => {
    expect(renderWeek([{ title: 'X' } as unknown as IssueI])).toBe(
      'Tienes 1 tarea esta semana: X.',
    );
  });
  it('many', () => {
    const items = ['A', 'B'].map((t) => ({ title: t }) as unknown as IssueI);
    expect(renderWeek(items)).toBe('Tienes 2 tareas esta semana: A, B.');
  });
});
