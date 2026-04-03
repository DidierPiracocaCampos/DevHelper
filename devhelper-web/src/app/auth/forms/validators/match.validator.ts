import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchOtherValidator(otherControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.parent) return null; // el parent aún no existe

        const otherControl = control.parent.get(otherControlName);
        if (!otherControl) return null;

        // Suscribirse a cambios del otro control para actualizar errores
        otherControl.valueChanges.subscribe(() => {
            control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });

        // Comparar valores
        return control.value === otherControl.value ? null : { notMatching: true };
    };
}