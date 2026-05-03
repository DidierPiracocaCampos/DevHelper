import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authenticator } from '../../../shared/service/authenticator';
import { EmailInput } from '../../components/email-input/email-input';
import { PasswordInput } from '../../components/password-input/password-input';
import firebasePasswordValidator from '../../../shared/forms/validators/password.validator';
import { ErrorMessage } from "../../../shared/forms/components/input-base/error-message";
import { NgClass } from '@angular/common';
import { matchOtherValidator } from '../../../shared/forms/validators/match.validator';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'auth-form-register',
  imports: [ReactiveFormsModule, EmailInput, PasswordInput, ErrorMessage, NgClass, RouterLink],
  templateUrl: './form-register.html',
  styleUrl: './form-register.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class FormRegister {
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _authenticator = inject(Authenticator);

  form = this._formBuilder.group({
    email: this._formBuilder.control<string>('', [Validators.email, Validators.required]),
    password: this._formBuilder.control<string>('', [Validators.required], [firebasePasswordValidator()]),
    verifyPassword: this._formBuilder.control<string>('', [Validators.required, matchOtherValidator('password')]),
  });

  onSubmit() {
    const f = this.form;
    if (f.invalid) {
      f.markAllAsDirty();
      return
    }
    const value = f.value;
    this._authenticator.register(value.email!, value.password!);
  }


}
