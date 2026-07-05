import { describe, it, expect } from 'vitest';
import { renderUnknown } from './unknown.template';

describe('renderUnknown', () => {
  it('suggests three intents', () => {
    const out = renderUnknown();
    expect(out).toContain('pendientes');
    expect(out).toContain('proyectos');
    expect(out).toContain('vencidas');
  });
});
