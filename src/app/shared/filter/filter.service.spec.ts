import { FilterService } from './filter.service';
import { FilterSchema } from './filter.types';

interface DemoEntity {
  name: string;
  size: number;
  secure: boolean;
  createdAt: Date;
}

const demoSchema: FilterSchema<DemoEntity> = {
  entity: 'demo',
  fields: [
    { key: 'name', label: 'Nombre', control: 'text', ops: ['==', '!='] },
    { key: 'size', label: 'Tamaño', control: 'number', ops: ['==', '>', '<'] },
    { key: 'secure', label: 'Seguro', control: 'boolean', ops: ['=='] },
    { key: 'createdAt', label: 'Creado', control: 'date', ops: ['==', '>', '<'] },
  ],
};

describe('FilterService', () => {
  let service: FilterService;

  beforeEach(() => {
    service = new FilterService();
  });

  it('starts with empty state', () => {
    expect(service.state()).toEqual([]);
  });

  it('apply sets state to the provided draft', () => {
    const draft = [{ key: 'name', op: '==' as const, value: 'foo' }];
    service.apply(demoSchema, draft);
    expect(service.state()).toEqual(draft);
  });

  it('apply drops filters with unknown keys', () => {
    const draft = [
      { key: 'name', op: '==' as const, value: 'foo' },
      { key: 'unknown', op: '==' as const, value: 'bar' },
    ];
    service.apply(demoSchema, draft);
    expect(service.state()).toEqual([{ key: 'name', op: '==', value: 'foo' }]);
  });

  it('apply drops filters with disallowed op', () => {
    const draft = [{ key: 'name', op: '>' as const, value: 'foo' }];
    service.apply(demoSchema, draft);
    expect(service.state()).toEqual([]);
  });

  it('remove clears the filter for the given key', () => {
    service.apply(demoSchema, [
      { key: 'name', op: '==', value: 'foo' },
      { key: 'size', op: '>', value: 10 },
    ]);
    service.remove('name');
    expect(service.state()).toEqual([{ key: 'size', op: '>', value: 10 }]);
  });

  it('reset clears all filters', () => {
    service.apply(demoSchema, [{ key: 'name', op: '==', value: 'foo' }]);
    service.reset();
    expect(service.state()).toEqual([]);
  });

  it('queryOptions returns filters tuple in state order', () => {
    service.apply(demoSchema, [
      { key: 'name', op: '==', value: 'foo' },
      { key: 'size', op: '>', value: 10 },
    ]);
    expect(service.queryOptions()).toEqual({
      filters: [
        ['name', '==', 'foo'],
        ['size', '>', 10],
      ],
    });
  });

  it('queryOptions returns empty object when no filters', () => {
    expect(service.queryOptions()).toEqual({});
  });

  it('apply converts date string values to Date instances for date fields', () => {
    const draft = [{ key: 'createdAt', op: '>' as const, value: '2026-01-15' }];
    service.apply(demoSchema, draft);
    const stored = service.state()[0];
    expect(stored.value).toBeInstanceOf(Date);
    expect((stored.value as Date).toISOString().slice(0, 10)).toBe('2026-01-15');
  });

  it('queryOptions returns the Date instance for date filters', () => {
    const draft = [{ key: 'createdAt', op: '>' as const, value: '2026-01-15' }];
    service.apply(demoSchema, draft);
    expect(service.queryOptions()).toEqual({
      filters: [['createdAt', '>', expect.any(Date)]],
    });
  });

  it('instances are independent - filters applied to one do not leak to another', () => {
    const serviceA = new FilterService();
    const serviceB = new FilterService();
    serviceA.apply(demoSchema, [{ key: 'name', op: '==' as const, value: 'foo' }]);
    expect(serviceA.state()).toEqual([{ key: 'name', op: '==', value: 'foo' }]);
    expect(serviceB.state()).toEqual([]);
    expect(serviceA.queryOptions()).toEqual({ filters: [['name', '==', 'foo']] });
    expect(serviceB.queryOptions()).toEqual({});
  });
});
