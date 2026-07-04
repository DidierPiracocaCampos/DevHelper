import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge, map } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { UiEmailField, UiPasswordField } from '../../../shared/forms/fields';
import firebasePasswordValidator from '../../../shared/forms/validators/password.validator';
import { ErrorMessage } from '../../../shared/forms/fields';
import { NgClass } from '@angular/common';
import { matchOtherValidator } from '../../../shared/forms/validators/match.validator';
import { RouterLink } from '@angular/router';
import { Loader } from '../../../shared/service/loader';

@Component({
  selector: 'auth-form-register',
  imports: [ReactiveFormsModule, UiEmailField, UiPasswordField, ErrorMessage, NgClass, RouterLink],
  templateUrl: './form-register.html',
  styleUrl: './form-register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormRegister {
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _destroyRef = inject(DestroyRef);

  loading = false;
  showVerificationMessage = false;

  form = this._formBuilder.group({
    email: this._formBuilder.control<string>('', [Validators.email, Validators.required]),
    password: this._formBuilder.control<string>(
      '',
      [Validators.required],
      [firebasePasswordValidator(this._destroyRef)],
    ),
    verifyPassword: this._formBuilder.control<string>('', [
      Validators.required,
      matchOtherValidator('password'),
    ]),
  });

  private _password = this.form.controls.password;

  readonly passwordValue = toSignal(this._password.valueChanges, {
    initialValue: this._password.value,
  });

  readonly passwordErrors = toSignal(
    merge(this._password.valueChanges, this._password.statusChanges).pipe(
      map(() => this._password.errors),
    ),
    { initialValue: this._password.errors },
  );

  readonly passwordTouched = toSignal(
    merge(this._password.valueChanges, this._password.statusChanges).pipe(
      map(() => this._password.touched),
    ),
    { initialValue: this._password.touched },
  );

  readonly passwordStatus = toSignal(
    merge(this._password.valueChanges, this._password.statusChanges).pipe(
      map(() => this._password.status),
    ),
    { initialValue: this._password.status },
  );

  readonly passwordValid = computed(() => this.passwordStatus() === 'VALID');

  constructor() {
    this.form.controls.password.valueChanges.subscribe(() => {
      this.form.controls.verifyPassword.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  async onSubmit() {
    const f = this.form;
    if (f.invalid) {
      f.markAllAsDirty();
      return;
    }
    const value = f.value;
    this.loading = true;
    this._loader.show();

    const result = await this._authenticator.register(value.email!, value.password!);

    this.loading = false;
    this._loader.hide();

    if (result.success) {
      this.showVerificationMessage = true;
      this.form.reset();
    }
  }
}
