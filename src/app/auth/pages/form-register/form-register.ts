import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, merge, map } from 'rxjs';
import { Authenticator } from '../../../shared/service/authenticator';
import { UiEmailField, UiPasswordField, ErrorMessage } from '../../../shared/forms/fields';
import firebasePasswordValidator from '../../../shared/forms/validators/password.validator';
import {
  PASSWORD_RULES,
  type PasswordRuleKey,
  type PasswordRuleStates,
  evaluatePasswordRules,
} from '../../../shared/forms/validators/password-rules';
import { matchOtherValidator } from '../../../shared/forms/validators/match.validator';
import { RouterLink } from '@angular/router';
import { Loader } from '../../../shared/service/loader';
import { PreferencesService } from '../../../shared/preferences/services/preferences.service';

@Component({
  selector: 'auth-form-register',
  imports: [ReactiveFormsModule, UiEmailField, UiPasswordField, ErrorMessage, RouterLink],
  templateUrl: './form-register.html',
  styleUrl: './form-register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormRegister {
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _prefs = inject(PreferencesService);

  loading = false;
  showVerificationMessage = false;

  readonly rules = PASSWORD_RULES;

  form = this._formBuilder.group({
    email: this._formBuilder.control<string>('', [Validators.email, Validators.required]),
    password: this._formBuilder.control<string>('', [
      Validators.required,
      firebasePasswordValidator(),
    ]),
    verifyPassword: this._formBuilder.control<string>('', [
      Validators.required,
      matchOtherValidator('password'),
    ]),
    acceptTerms: this._formBuilder.control<boolean>(false, [Validators.requiredTrue]),
  });

  private readonly _password = this.form.controls.password;
  private readonly _blurTick$ = new Subject<void>();

  readonly passwordValue = toSignal(this._password.valueChanges, {
    initialValue: this._password.value,
  });

  readonly passwordTouched = toSignal(
    merge(this._password.valueChanges, this._password.statusChanges, this._blurTick$).pipe(
      map(() => this._password.touched),
    ),
    { initialValue: this._password.touched },
  );

  readonly ruleStates = computed<PasswordRuleStates>(() =>
    evaluatePasswordRules(this.passwordValue()),
  );

  onFormFocusOut() {
    this._blurTick$.next();
  }

  rowClass(key: PasswordRuleKey): { success: boolean; error: boolean } {
    const met = this.ruleStates()[key];
    const touched = this.passwordTouched();
    return {
      success: met,
      error: !met && touched,
    };
  }

  rowIcon(key: PasswordRuleKey): string {
    const met = this.ruleStates()[key];
    return met ? 'check' : this.passwordTouched() ? 'error' : 'remove';
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
      try {
        await this._prefs.setAiAssistantEnabled(true);
      } catch (err) {
        console.warn('[FormRegister] could not enable AI assistant preference', err);
      }
      this.showVerificationMessage = true;
      this.form.reset();
    }
  }
}
