import { FILE_FILTER_SCHEMA } from './file-filter.schema';

describe('FILE_FILTER_SCHEMA', () => {
  it('exposes the expected filterable fields', () => {
    const keys = FILE_FILTER_SCHEMA.fields.map((f) => f.key);
    expect(keys).toEqual(['name', 'mimeType', 'tags']);
  });

  it('configures the Etiqueta field with multiple operators so it renders a select', () => {
    const tags = FILE_FILTER_SCHEMA.fields.find((f) => f.key === 'tags');
    expect(tags).toBeDefined();
    expect(tags?.label).toBe('Etiqueta');
    expect(tags?.ops.length).toBeGreaterThan(1);
    expect(tags?.ops).toContain('array-contains');
  });
});
