import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';
import { UiFieldErrors } from '../ui-field/ui-field-errors';

@Component({
  selector: 'ui-time-field',
  imports: [NgTemplateOutlet, UiFieldErrors],
  templateUrl: './ui-time-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTimeField),
      multi: true,
    },
    {
      provide: UiField,
      useExisting: forwardRef(() => UiTimeField),
    },
  ],
})
export class UiTimeField extends UiField<string> {
  labelText = input<string>('');
  step = input<string>('60');
  placeholder = input<string>('');

  onInput(event: Event) {
    this.handleInput(event);
  }

  onBlur() {
    this.handleBlur();
  }
}
