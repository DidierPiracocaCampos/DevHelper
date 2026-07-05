import { describe, it, expect } from 'vitest';
import type { ProjectI } from '../../domain/project.interface';
import { renderProjects } from './projects.template';

describe('renderProjects', () => {
  it('returns empty when no projects', () => {
    expect(renderProjects([])).toBe('No tienes proyectos activos.');
  });
  it('lists singular', () => {
    expect(renderProjects([{ name: 'DevHelper' } as unknown as ProjectI])).toBe(
      'Tienes 1 proyecto activo: DevHelper.',
    );
  });
  it('lists multiple', () => {
    const items = [{ name: 'A' }, { name: 'B' }].map((p) => p as unknown as ProjectI);
    expect(renderProjects(items)).toBe('Tienes 2 proyectos activos: A, B.');
  });
});
