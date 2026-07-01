import { describe, it, expect } from 'vitest';
import { projectFilterSchema } from './project-filter.schema';

describe('projectFilterSchema', () => {
  it('exposes name, tag, archived and createdAt as filterable fields', () => {
    const keys = projectFilterSchema.fields.map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['name', 'tag', 'archived', 'createdAt']));
  });

  it('uses the proyectos entity name', () => {
    expect(projectFilterSchema.entity).toBe('proyectos');
  });

  it('marks name and tag as text fields with equality ops', () => {
    const name = projectFilterSchema.fields.find((f) => f.key === 'name');
    const tag = projectFilterSchema.fields.find((f) => f.key === 'tag');
    expect(name?.control).toBe('text');
    expect(tag?.control).toBe('text');
    expect(name?.ops).toEqual(['==', '!=']);
    expect(tag?.ops).toEqual(['==', '!=']);
  });

  it('marks archived as a boolean field with equality ops', () => {
    const archived = projectFilterSchema.fields.find((f) => f.key === 'archived');
    expect(archived?.control).toBe('boolean');
    expect(archived?.ops).toEqual(['==', '!=']);
  });
});
