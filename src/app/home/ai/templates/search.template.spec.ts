import { describe, it, expect } from 'vitest';
import { renderSearch } from './search.template';

describe('renderSearch', () => {
  it('empty results', () => {
    expect(renderSearch([])).toBe('No encontré coincidencias para tu búsqueda.');
  });
  it('one match', () => {
    const matches = [{ id: '1', title: 'A', collection: 'issues' as const, score: 0.85 }];
    expect(renderSearch(matches)).toBe('Encontré 1 coincidencia: A (de issues, relevancia 0.85).');
  });
  it('multiple matches', () => {
    const matches = [
      { id: '1', title: 'A', collection: 'issues' as const, score: 0.9 },
      { id: '2', title: 'B', collection: 'proyectos' as const, score: 0.7 },
    ];
    expect(renderSearch(matches)).toBe(
      'Encontré 2 coincidencias: A (de issues, relevancia 0.90), B (de proyectos, relevancia 0.70).',
    );
  });
});
