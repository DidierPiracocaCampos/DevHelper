import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ActiveFilter, AnyFilterField } from '../filter.types';

@Component({
  selector: 'filter-chip',
  templateUrl: './filter-chip.html',
  styleUrl: './filter-chip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChip {
  field = input.required<AnyFilterField>();
  value = input.required<ActiveFilter>();

  remove = output<string>();

  protected readonly displayValue = computed(() => formatValue(this.field(), this.value().value));

  protected onRemove(): void {
    this.remove.emit(this.field().key);
  }
}

export function formatValue(field: AnyFilterField, raw: unknown): string {
  if (raw === null || raw === undefined) return '';

  switch (field.control) {
    case 'boolean':
      return raw ? 'Sí' : 'No';
    case 'date': {
      const d = raw instanceof Date ? raw : new Date(String(raw));
      return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString();
    }
    case 'select': {
      const match = field.options?.find((o) => o.value === raw);
      return match?.label ?? String(raw);
    }
    case 'number':
    case 'text':
    default:
      return String(raw);
  }
}
