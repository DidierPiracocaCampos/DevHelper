import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';

@Component({
  selector: 'ui-password-field',
  imports: [NgTemplateOutlet],
  templateUrl: './ui-password-field.html',
  styleUrl: './ui-password-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiPasswordField),
      multi: true,
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
    this.setDirty();
    this.emitValue((event.target as HTMLInputElement).value);
  }

  onBlur() {
    this.emitTouched();
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
