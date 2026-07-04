import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';
import { UiFieldErrors } from '../ui-field/ui-field-errors';

@Component({
  selector: 'ui-date-field',
  imports: [NgTemplateOutlet, UiFieldErrors],
  templateUrl: './ui-date-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDateField),
      multi: true,
    },
    {
      provide: UiField,
      useExisting: forwardRef(() => UiDateField),
    },
  ],
})
export class UiDateField extends UiField<string> {
  labelText = input<string>('');
  min = input<string>('');
  max = input<string>('');
  placeholder = input<string>('');

  onInput(event: Event) {
    this.handleInput(event);
  }

  onBlur() {
    this.handleBlur();
  }
}
