import { ValidationErrors, ValidatorFn } from '@angular/forms';
import { evaluatePasswordRules, passwordMeetsAllRules } from './password-rules';

export default function firebasePasswordValidator(): ValidatorFn {
  return (control): ValidationErrors | null => {
    const value = (control.value ?? '') as string;
    if (!value) return null;
    if (passwordMeetsAllRules(value)) return null;
    return { firebasePassword: evaluatePasswordRules(value) };
  };
}
