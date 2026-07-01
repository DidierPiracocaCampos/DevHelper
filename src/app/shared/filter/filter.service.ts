import { computed, Injectable, signal } from '@angular/core';
import { QueryOptions } from '../api/api.interfaces';
import { ActiveFilters, FilterField, FilterOp, FilterSchema } from './filter.types';

@Injectable()
export class FilterService {
  readonly state = signal<ActiveFilters>([]);

  apply<T>(schema: FilterSchema<T>, draft: ActiveFilters): void {
    const validated = draft
      .filter((f) => this._isValid(schema, f))
      .map((f) => this._normalize(schema, f));
    this.state.set(validated);
  }

  remove(key: string): void {
    this.state.update((current) => current.filter((f) => f.key !== key));
  }

  reset(): void {
    this.state.set([]);
  }

  readonly queryOptions = computed<QueryOptions>(() => {
    const filters = this.state().map<[string, FilterOp, unknown]>((f) => [f.key, f.op, f.value]);
    return filters.length > 0 ? { filters } : {};
  });

  private _isValid<T>(schema: FilterSchema<T>, filter: ActiveFilters[number]): boolean {
    const field = schema.fields.find((f) => (f as FilterField<T>).key === filter.key);
    if (!field) return false;
    return field.ops.includes(filter.op);
  }

  private _normalize<T>(
    schema: FilterSchema<T>,
    filter: ActiveFilters[number],
  ): ActiveFilters[number] {
    const field = schema.fields.find((f) => (f as FilterField<T>).key === filter.key);
    if (field?.control === 'date' && typeof filter.value === 'string') {
      return { ...filter, value: new Date(filter.value) };
    }
    return filter;
  }
}
