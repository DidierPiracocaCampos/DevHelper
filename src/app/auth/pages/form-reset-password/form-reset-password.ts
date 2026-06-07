import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiEmailField } from '../../../shared/forms/fields';
import { RouterLink } from '@angular/router';
import { Authenticator, AuthErrorCode } from '../../../shared/service/authenticator';
import { Loader } from '../../../shared/service/loader';

@Component({
  selector: 'app-form-reset-password',
  imports: [ReactiveFormsModule, UiEmailField, RouterLink],
  templateUrl: './form-reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormResetPassword {
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);

  loading = false;
  successMessage = signal(false);
  errorMessage = signal<string | null>(null);

  form = this._formBuilder.group({
    email: this._formBuilder.control<string>('', [Validators.email, Validators.required]),
  });

  async onSubmit() {
    const f = this.form;
    if (f.invalid) {
      f.markAllAsDirty();
      return;
    }
    const value = f.value;
    this.loading = true;
    this._loader.show();
    this.errorMessage.set(null);

    const result = await this._authenticator.sendPasswordResetEmail(value.email!);

    this.loading = false;
    this._loader.hide();

    if (result.success || result.error === AuthErrorCode.UserNotFound) {
      this.successMessage.set(true);
      this.form.reset();
    } else {
      this.errorMessage.set(this._getErrorMessage(result.error));
    }
  }

  private _getErrorMessage(errorCode: string | undefined): string {
    if (!errorCode) return 'Error desconocido';
    if (errorCode === AuthErrorCode.InvalidEmail) {
      return 'Correo electrónico inválido';
    }
    return 'Error al enviar el correo de recuperación';
  }
}
