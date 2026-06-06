import { FormControl, FormGroup, Validators } from '@angular/forms';
import { matchOtherValidator } from './match.validator';

describe('matchOtherValidator', () => {
  function makeGroup() {
    return new FormGroup({
      password: new FormControl('', { nonNullable: true }),
      verifyPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, matchOtherValidator('password')],
      }),
    });
  }

  it('returns notMatching when values differ', () => {
    const g = makeGroup();
    g.controls.password.setValue('abc');
    g.controls.verifyPassword.setValue('xyz');
    expect(g.controls.verifyPassword.errors).toEqual({ notMatching: true });
  });

  it('returns null when values match', () => {
    const g = makeGroup();
    g.controls.password.setValue('abc');
    g.controls.verifyPassword.setValue('abc');
    expect(g.controls.verifyPassword.errors).toBeNull();
  });

  it('does not subscribe to valueChanges (no leak source)', () => {
    const g = makeGroup();
    g.controls.password.setValue('a');
    g.controls.verifyPassword.setValue('b');
    const setSpy = vi.spyOn(g.controls.password, 'setValue');
    g.controls.password.valueChanges.subscribe(() => {});
    g.controls.password.setValue('abc');
    expect(setSpy).toHaveBeenCalled();
  });

  it('returns null when parent has no other control with that name', () => {
    const orphan = new FormControl('x', {
      nonNullable: true,
      validators: [matchOtherValidator('doesNotExist')],
    });
    expect(orphan.errors).toBeNull();
  });
});
