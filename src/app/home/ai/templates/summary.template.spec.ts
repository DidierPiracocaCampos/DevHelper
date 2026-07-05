import { describe, it, expect } from 'vitest';
import type { IssueI } from '../../domain/issue.interface';
import { renderSummary } from './summary.template';

describe('renderSummary', () => {
  it('empty', () => {
    expect(renderSummary('DevHelper', [])).toBe('No hay contenido para resumir en DevHelper.');
  });
  it('extracts top 3', () => {
    const items = ['A', 'B', 'C', 'D', 'E'].map((t) => ({ title: t }) as unknown as IssueI);
    expect(renderSummary('X', items)).toBe(
      'El modo actual no genera resúmenes libres. Estos son los puntos clave de tu proyecto X: A, B, C.',
    );
  });
  it('extracts 1 if only 1', () => {
    expect(renderSummary('X', [{ title: 'A' } as unknown as IssueI])).toBe(
      'El modo actual no genera resúmenes libres. Estos son los puntos clave de tu proyecto X: A.',
    );
  });
});
