import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailInput } from '../../components/email-input/email-input';
import { PasswordInput } from '../../components/password-input/password-input';
import { RouterLink } from '@angular/router';
import { Authenticator, AuthErrorCode } from '../../../shared/service/authenticator';
import { Loader } from '../../../shared/service/loader';

@Component({
  selector: 'app-form-login',
  imports: [ReactiveFormsModule, EmailInput, PasswordInput, RouterLink],
  templateUrl: './form-login.html',
  styleUrl: './form-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class FormLogin {
  private _authenticator = inject(Authenticator);
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _loader = inject(Loader);

  loading = false;

  form = this._formBuilder.group({
    email: this._formBuilder.control<string>('', [Validators.email, Validators.required]),
    password: this._formBuilder.control<string>('', [Validators.required])
  });

  async onSubmit() {
    const f = this.form;
    if (f.invalid) {
      f.markAllAsDirty();
      return
    }
    const value = f.value;
    this.loading = true;
    this._loader.show();

    const result = await this._authenticator.login(value.email!, value.password!);

    this.loading = false;
    this._loader.hide();

    if (!result.success && result.error) {
      this._handleAuthError(result.error);
    }
  }

  private _handleAuthError(errorCode: string): void {
    if (errorCode === AuthErrorCode.TooManyRequests) {
      this.form.setErrors({ customError: 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.' });
    } else {
      this.form.get('email')?.setErrors({ FirebaseError: errorCode });
      this.form.get('password')?.setErrors({ FirebaseError: errorCode });
      this.form.setErrors({ FirebaseError: errorCode });
    }
  }

}
