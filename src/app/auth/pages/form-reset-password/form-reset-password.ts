import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailInput } from '../../components/email-input/email-input';
import { PasswordInput } from '../../components/password-input/password-input';
import { RouterLink } from '@angular/router';
import { Authenticator } from '../../../shared/service/authenticator';
import { Loader } from '../../../shared/service/loader';

@Component({
  selector: 'app-form-reset-password',
  imports: [ReactiveFormsModule, EmailInput, RouterLink],
  templateUrl: './form-reset-password.html',
  styleUrl: './form-reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class FormResetPassword {
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);

  loading = false;
  successMessage = signal(false);
  errorMessage = signal<string | null>(null);

  form = this._formBuilder.group({
    email: this._formBuilder.control<string>('', [Validators.email, Validators.required])
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
    this.errorMessage.set(null);

    const result = await this._authenticator.sendPasswordResetEmail(value.email!);

    this.loading = false;
    this._loader.hide();

    if (result.success) {
      this.successMessage.set(true);
      this.form.reset();
    } else {
      this.errorMessage.set(this._getErrorMessage(result.error));
    }
  }

  private _getErrorMessage(errorCode: string | undefined): string {
    if (!errorCode) return 'Error desconocido';
    if (errorCode === 'auth/user-not-found') {
      return 'No existe una cuenta con este correo';
    }
    if (errorCode === 'auth/invalid-email') {
      return 'Correo electrónico inválido';
    }
    return 'Error al enviar el correo de recuperación';
  }

}