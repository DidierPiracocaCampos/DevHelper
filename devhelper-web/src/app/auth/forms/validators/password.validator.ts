import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { getAuth, validatePassword } from 'firebase/auth';

export default function  firebasePasswordValidator(): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
        const password = control.value;
        if (!password) return null;
        const auth = getAuth();
        try {
            const status = await validatePassword(auth, password);

            if (status.isValid) {
                return null;
            }
            
            return {
                firebasePassword: {
                    minLength: status.meetsMinPasswordLength ,
                    lower: status.containsLowercaseLetter ,
                    upper: status.containsUppercaseLetter,
                    number: status.containsNumericCharacter,
                    special: status.containsNonAlphanumericCharacter,
                }
            };

        } catch (error) {
            console.error(error);
            return null; // no bloquear por error técnico
        }
    };
}