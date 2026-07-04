import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';
import { UiFieldErrors } from '../ui-field/ui-field-errors';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'ui-select-field',
  imports: [NgTemplateOutlet, UiFieldErrors],
  templateUrl: './ui-select-field.html',
  styleUrl: './ui-select-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectField),
      multi: true,
    },
  ],
})
export class UiSelectField<T extends string = string> extends UiField<T> {
  options = input.required<ReadonlyArray<SelectOption<T>>>();
  labelText = input<string>('');
  placeholder = input<string>('');

  onChange(event: Event) {
    this.handleInput(event);
  }

  onBlur() {
    this.handleBlur();
  }
}
