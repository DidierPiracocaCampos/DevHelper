import { FilterOp, OP_LABELS } from './filter.types';

describe('OP_LABELS', () => {
  it('maps every supported Firestore operator to a human-readable Spanish label', () => {
    const expected: Record<FilterOp, string> = {
      '==': 'igual a',
      '!=': 'diferente de',
      '>': 'mayor que',
      '>=': 'mayor o igual que',
      '<': 'menor que',
      '<=': 'menor o igual que',
      in: 'en',
      'array-contains': 'contiene',
    };
    for (const op of Object.keys(expected) as FilterOp[]) {
      expect(OP_LABELS[op]).toBe(expected[op]);
    }
  });

  it('has no empty labels', () => {
    for (const [op, label] of Object.entries(OP_LABELS)) {
      expect(label, `label for ${op}`).toBeTruthy();
      expect(label.trim().length, `label for ${op}`).toBeGreaterThan(0);
    }
  });
});
