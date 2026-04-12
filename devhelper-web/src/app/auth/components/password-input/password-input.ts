import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBase } from '../../../shared/forms/components/input-base/input-base';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'auth-password-input',
  imports: [NgTemplateOutlet],
  templateUrl: './password-input.html',
  styleUrl: './password-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInput),
      multi: true,
    },
  ]
})
export class PasswordInput extends InputBase<string> {
  label = input<string>('Contraseña');
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}