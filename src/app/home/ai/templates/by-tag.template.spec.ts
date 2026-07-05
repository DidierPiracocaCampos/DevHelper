import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderByTag } from './by-tag.template';

describe('renderByTag', () => {
  it('empty', () => {
    expect(renderByTag('urgente', [])).toBe('No hay tareas con el tag "urgente".');
  });
  it('one', () => {
    expect(renderByTag('bug', [{ title: 'A' } as unknown as IssueI])).toBe(
      'Hay 1 tarea con el tag "bug": A.',
    );
  });
  it('many', () => {
    const items = ['A', 'B'].map((t) => ({ title: t }) as unknown as IssueI);
    expect(renderByTag('bug', items)).toBe('Hay 2 tareas con el tag "bug": A, B.');
  });
});
