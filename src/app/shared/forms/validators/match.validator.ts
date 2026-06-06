import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchOtherValidator(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) return null;
    const otherControl = control.parent.get(otherControlName);
    if (!otherControl) return null;
    return control.value === otherControl.value ? null : { notMatching: true };
  };
}
