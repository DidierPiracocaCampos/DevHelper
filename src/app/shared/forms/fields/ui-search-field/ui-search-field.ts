import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';

@Component({
  selector: 'ui-search-field',
  imports: [NgTemplateOutlet],
  templateUrl: './ui-search-field.html',
  styleUrl: './ui-search-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSearchField),
      multi: true,
    },
  ],
})
export class UiSearchField extends UiField<string> {
  placeholder = input<string>('Buscar…');
  debounceMs = input<number>(0);

  search = output<string>();

  readonly hasValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined && v !== '';
  });

  onInput(event: Event) {
    this.setDirty();
    this.emitValue((event.target as HTMLInputElement).value);
  }

  onBlur() {
    this.emitTouched();
  }

  clear() {
    this.emitValue('');
  }
}
