import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiField } from '../ui-field/ui-field';
import { UiFieldErrors } from '../ui-field/ui-field-errors';

@Component({
  selector: 'ui-email-field',
  imports: [UiFieldErrors],
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
    this.handleInput(event);
  }

  onBlur() {
    this.handleBlur();
  }
}
