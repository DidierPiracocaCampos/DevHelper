import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { getAuth, validatePassword } from 'firebase/auth';
import { Subject, debounceTime, distinctUntilChanged, from, switchMap } from 'rxjs';

const subjects = new WeakMap<AbstractControl, Subject<string>>();

interface FirebasePasswordStatus {
  isValid: boolean;
  meetsMinPasswordLength?: boolean;
  containsLowercaseLetter?: boolean;
  containsUppercaseLetter?: boolean;
  containsNumericCharacter?: boolean;
  containsNonAlphanumericCharacter?: boolean;
}

function toErrors(status: FirebasePasswordStatus): ValidationErrors | null {
  if (status.isValid) return null;
  return {
    firebasePassword: {
      minLength: status.meetsMinPasswordLength,
      lower: status.containsLowercaseLetter,
      upper: status.containsUppercaseLetter,
      number: status.containsNumericCharacter,
      special: status.containsNonAlphanumericCharacter,
    },
  };
}

export default function firebasePasswordValidator(
  destroyRef: DestroyRef,
  debounceMs = 300,
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return Promise.resolve(null);
    }

    let bus = subjects.get(control);
    if (!bus) {
      bus = new Subject<string>();
      subjects.set(control, bus);
      bus
        .pipe(
          debounceTime(debounceMs),
          distinctUntilChanged(),
          switchMap((value) => from(validatePassword(getAuth(), value).then(toErrors))),
          takeUntilDestroyed(destroyRef),
        )
        .subscribe((result) => {
          const current = control.errors ?? {};
          const next = { ...current };
          if (result === null) {
            delete next['firebasePassword'];
          } else {
            next['firebasePassword'] = result['firebasePassword'];
          }
          control.setErrors(Object.keys(next).length ? next : null);
        });
    }

    bus.next(control.value);
    return Promise.resolve(null);
  };
}
