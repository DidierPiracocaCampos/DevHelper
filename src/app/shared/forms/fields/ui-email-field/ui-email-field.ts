import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';

@Component({
  selector: 'ui-email-field',
  imports: [NgTemplateOutlet],
  templateUrl: './ui-email-field.html',
  styleUrl: './ui-email-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiEmailField),
      multi: true,
    },
  ],
})
export class UiEmailField extends UiField<string> {
  labelText = input<string>('Correo electrónico');
  placeholder = input<string>('mail@site.com');
  autocomplete = input<string>('email');

  onInput(event: Event) {
    this.setDirty();
    this.emitValue((event.target as HTMLInputElement).value);
  }

  onBlur() {
    this.emitTouched();
  }
}
