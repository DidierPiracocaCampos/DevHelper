import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';
import { UiFieldErrors } from '../ui-field/ui-field-errors';

@Component({
  selector: 'ui-textarea-field',
  imports: [NgTemplateOutlet, UiFieldErrors],
  templateUrl: './ui-textarea-field.html',
  styleUrl: './ui-textarea-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaField),
      multi: true,
    },
    {
      provide: UiField,
      useExisting: forwardRef(() => UiTextareaField),
    },
  ],
})
export class UiTextareaField extends UiField<string> {
  placeholder = input<string>('');
  rows = input<number>(4);
  maxlength = input<number | null>(null);

  readonly charCount = computed(() => (this.value() ?? '').length);

  onInput(event: Event) {
    this.handleInput(event);
  }

  onBlur() {
    this.handleBlur();
  }
}
