import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiModal } from '../../components/ui-modal/ui-modal';
import { UiButton } from '../../components/ui-button/button';
import { SelectOption, UiSelectField } from '../../forms/fields';
import {
  ActiveFilter,
  ActiveFilters,
  FilterField,
  FilterOp,
  FilterSchema,
  OP_LABELS,
} from '../filter.types';

interface DraftEntry {
  key: string;
  op: FilterOp;
  value: unknown;
  enabled: boolean;
}

@Component({
  selector: 'filter-modal',
  imports: [FormsModule, UiModal, UiButton, UiSelectField],
  templateUrl: './filter-modal.html',
  styleUrl: './filter-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterModal<T> {
  schema = input.required<FilterSchema<T>>();
  initialFilters = input<ActiveFilters>([]);
  title = input<string>('Filtros');

  isOpen = model<boolean>(false);

  apply = output<ActiveFilters>();
  clear = output<void>();

  protected draft = signal<DraftEntry[]>([]);

  protected readonly fields = (): ReadonlyArray<FilterField<T>> => this.schema().fields;

  protected opOptionsFor(field: FilterField<T>): ReadonlyArray<SelectOption<string>> {
    return field.ops.map((op) => ({ value: op, label: OP_LABELS[op] }));
  }

  protected opLabel(op: FilterOp): string {
    return OP_LABELS[op];
  }

  protected valueOptionsFor(field: FilterField<T>): ReadonlyArray<SelectOption<string>> {
    return (field.options ?? []) as ReadonlyArray<SelectOption<string>>;
  }

  protected readonly booleanOptions: ReadonlyArray<SelectOption<string>> = [
    { value: 'true', label: 'Sí' },
    { value: 'false', label: 'No' },
  ];

  protected entryFor(key: string): DraftEntry {
    const entries = this.draft();
    const entry = entries.find((e) => e.key === key);
    return entry ?? { key, op: '==', value: null, enabled: false };
  }

  private _syncDraftEffect = effect(() => {
    const schema = this.schema();
    const initial = this.initialFilters();
    const fields = schema.fields;

    this.draft.set(
      fields.map((field) => {
        const existing = initial.find((i) => i.key === field.key);
        return {
          key: field.key,
          op: existing?.op ?? field.ops[0],
          value: existing?.value ?? this._defaultValueFor(field),
          enabled: !!existing,
        };
      }),
    );
  });

  onOpChange(key: string, raw: string): void {
    const op = raw as FilterOp;
    this.draft.update((entries) =>
      entries.map((e) => (e.key === key ? { ...e, op, enabled: true } : e)),
    );
  }

  onValueChange(key: string, value: unknown): void {
    this.draft.update((entries) =>
      entries.map((e) => (e.key === key ? { ...e, value, enabled: this._isMeaningful(value) } : e)),
    );
  }

  onToggle(key: string, enabled: boolean): void {
    this.draft.update((entries) => entries.map((e) => (e.key === key ? { ...e, enabled } : e)));
  }

  onApply(): void {
    const result: ActiveFilter[] = this.draft()
      .filter((e) => e.enabled && this._isMeaningful(e.value))
      .map((e) => ({ key: e.key, op: e.op, value: e.value }));
    this.apply.emit(result);
    this.isOpen.set(false);
  }

  onClear(): void {
    this.clear.emit();
    this.isOpen.set(false);
  }

  private _isMeaningful(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }

  private _defaultValueFor(field: FilterField<T>): unknown {
    switch (field.control) {
      case 'boolean':
        return false;
      case 'number':
        return null;
      case 'text':
        return '';
      case 'date':
        return '';
      case 'select':
        return field.options?.[0]?.value ?? null;
    }
  }
}
