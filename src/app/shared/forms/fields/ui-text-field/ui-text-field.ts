import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';

@Component({
  selector: 'ui-text-field',
  imports: [NgTemplateOutlet],
  templateUrl: './ui-text-field.html',
  styleUrl: './ui-text-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextField),
      multi: true,
    },
  ],
})
export class UiTextField extends UiField<string> {
  labelText = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'>('text');
  placeholder = input<string>('');
  inputmode = input<string>('');
  autocomplete = input<string>('');

  onInput(event: Event) {
    this.setDirty();
    this.emitValue((event.target as HTMLInputElement).value);
  }

  onBlur() {
    this.emitTouched();
  }
}
