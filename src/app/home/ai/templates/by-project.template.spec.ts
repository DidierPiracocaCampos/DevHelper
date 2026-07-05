import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderByProject } from './by-project.template';

describe('renderByProject', () => {
  it('empty', () => {
    expect(renderByProject('DevHelper', [])).toBe('El proyecto DevHelper no tiene tareas.');
  });
  it('one', () => {
    expect(renderByProject('X', [{ title: 'A' } as unknown as IssueI])).toBe(
      'El proyecto X tiene 1 tarea: A.',
    );
  });
  it('many', () => {
    const items = ['A', 'B'].map((t) => ({ title: t }) as unknown as IssueI);
    expect(renderByProject('X', items)).toBe('El proyecto X tiene 2 tareas: A, B.');
  });
});
