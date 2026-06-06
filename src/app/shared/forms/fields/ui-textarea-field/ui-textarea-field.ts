import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';

@Component({
  selector: 'ui-textarea-field',
  imports: [NgTemplateOutlet],
  templateUrl: './ui-textarea-field.html',
  styleUrl: './ui-textarea-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaField),
      multi: true,
    },
  ],
})
export class UiTextareaField extends UiField<string> {
  placeholder = input<string>('');
  rows = input<number>(4);
  maxlength = input<number | null>(null);

  readonly charCount = computed(() => (this.value() ?? '').length);

  onInput(event: Event) {
    this.setDirty();
    this.emitValue((event.target as HTMLTextAreaElement).value);
  }

  onBlur() {
    this.emitTouched();
  }
}
