import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FilterService } from '../filter.service';
import { ActiveFilters, FilterSchema } from '../filter.types';
import { FilterModal } from '../filter-modal/filter-modal';
import { UiCardButton } from '../../components/card-button/card-button';

@Component({
  selector: 'filter-bar',
  imports: [FilterModal, UiCardButton],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar<T> {
  private _filter = inject(FilterService);

  schema = input.required<FilterSchema<T>>();
  activeFilters = input<ActiveFilters>([]);

  apply = output<ActiveFilters>();
  clear = output<void>();

  readonly state = computed<ActiveFilters>(() => this._filter.state());
  readonly count = computed<number>(() => this.state().length);
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  onApply(filters: ActiveFilters): void {
    this._filter.apply(this.schema(), filters);
    this.isOpen.set(false);
    this.apply.emit(this._filter.state());
  }

  onClear(): void {
    this._filter.reset();
    this.isOpen.set(false);
    this.clear.emit();
  }
}
