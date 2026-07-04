import { WhereFilterOp } from '@angular/fire/firestore';

export type FilterControlKind = 'text' | 'number' | 'date' | 'boolean' | 'select';

export type FilterOp = Extract<
  WhereFilterOp,
  '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'array-contains'
>;

export const OP_LABELS: Record<FilterOp, string> = {
  '==': 'igual a',
  '!=': 'diferente de',
  '>': 'mayor que',
  '>=': 'mayor o igual que',
  '<': 'menor que',
  '<=': 'menor o igual que',
  in: 'en',
  'array-contains': 'contiene',
};

export interface FilterFieldOption<V = unknown> {
  label: string;
  value: V;
}

export interface FilterField<T> {
  key: Extract<keyof T, string>;
  label: string;
  control: FilterControlKind;
  ops: readonly FilterOp[];
  options?: ReadonlyArray<FilterFieldOption>;
  placeholder?: string;
}

export interface FilterSchema<T> {
  entity: string;
  fields: ReadonlyArray<FilterField<T>>;
}

export interface ActiveFilter {
  key: string;
  op: FilterOp;
  value: unknown;
}

export type ActiveFilters = ReadonlyArray<ActiveFilter>;

export type AnyFilterField = FilterField<Record<string, unknown>>;
