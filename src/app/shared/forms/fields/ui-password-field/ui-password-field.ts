import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiField } from '../ui-field/ui-field';
import { UiFieldErrors } from '../ui-field/ui-field-errors';

@Component({
  selector: 'ui-password-field',
  imports: [UiFieldErrors],
  templateUrl: './ui-password-field.html',
  styleUrl: './ui-password-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiPasswordField),
      multi: true,
    },
    {
      provide: UiField,
      useExisting: forwardRef(() => UiPasswordField),
    },
  ],
})
export class UiPasswordField extends UiField<string> {
  labelText = input<string>('Contraseña');
  placeholder = input<string>('');
  autocomplete = input<string>('current-password');

  readonly showPassword = signal<boolean>(false);
  readonly inputType = computed(() => (this.showPassword() ? 'text' : 'password'));

  onInput(event: Event) {
    this.handleInput(event);
  }

  onBlur() {
    this.handleBlur();
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onToggleKeydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.togglePassword();
    }
  }
}
