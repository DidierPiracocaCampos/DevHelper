import { FilterService } from './filter.service';
import { FilterSchema } from './filter.types';

interface DemoEntity {
  name: string;
  size: number;
  secure: boolean;
}

const demoSchema: FilterSchema<DemoEntity> = {
  entity: 'demo',
  fields: [
    { key: 'name', label: 'Nombre', control: 'text', ops: ['==', '!='] },
    { key: 'size', label: 'Tamaño', control: 'number', ops: ['==', '>', '<'] },
    { key: 'secure', label: 'Seguro', control: 'boolean', ops: ['=='] },
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
});
