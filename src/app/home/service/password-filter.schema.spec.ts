import { describe, it, expect } from 'vitest';
import { passwordFilterSchema } from './password-filter.schema';

describe('passwordFilterSchema', () => {
  it('does not include the secure field', () => {
    const keys = passwordFilterSchema.fields.map((f) => f.key);
    expect(keys).not.toContain('secure');
  });

  it('exposes name, createdAt as filterable fields', () => {
    const keys = passwordFilterSchema.fields.map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['name', 'createdAt']));
  });
});
