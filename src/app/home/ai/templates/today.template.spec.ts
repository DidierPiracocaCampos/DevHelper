import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderToday } from './today.template';

describe('renderToday', () => {
  it('empty', () => {
    expect(renderToday([])).toBe('No tienes tareas para hoy.');
  });
  it('one', () => {
    expect(renderToday([{ title: 'X' } as unknown as IssueI])).toBe('Tienes 1 tarea para hoy: X.');
  });
  it('many', () => {
    const items = ['A', 'B', 'C'].map((t) => ({ title: t }) as unknown as IssueI);
    expect(renderToday(items)).toBe('Tienes 3 tareas para hoy: A, B, C.');
  });
});
