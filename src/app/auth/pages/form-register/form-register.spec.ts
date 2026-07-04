import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import FormRegister from './form-register';
import { Authenticator } from '../../../shared/service/authenticator';
import { Loader } from '../../../shared/service/loader';

describe('FormRegister password requirements list', () => {
  let fixture: ComponentFixture<FormRegister>;
  let component: FormRegister;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRegister],
      providers: [
        provideRouter([]),
        { provide: Authenticator, useValue: { register: vi.fn() } },
        { provide: Loader, useValue: { show: vi.fn(), hide: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function rowIcon(rowIndex: number): HTMLElement {
    const list = fixture.nativeElement.querySelector('ul.list') as HTMLElement;
    const rows = list.querySelectorAll('li.list-row');
    return rows[rowIndex].querySelector('span.icon') as HTMLElement;
  }

  it('all 5 rows render with danger style when password is empty (no value, no error)', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      const icon = rowIcon(i);
      expect(icon.classList.contains('error')).toBe(true);
      expect(icon.classList.contains('success')).toBe(false);
    }
  });

  it('only unmet rows are danger, met rows stay neutral when password is "p" (only lowercase)', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    password.setErrors({
      firebasePassword: {
        minLength: false,
        lower: true,
        upper: false,
        number: false,
        special: false,
      },
    });
    fixture.detectChanges();

    expect(rowIcon(0).classList.contains('error')).toBe(true);
    expect(rowIcon(0).classList.contains('success')).toBe(false);
    expect(rowIcon(1).classList.contains('error')).toBe(false);
    expect(rowIcon(1).classList.contains('success')).toBe(false);
    expect(rowIcon(2).classList.contains('error')).toBe(true);
    expect(rowIcon(2).classList.contains('success')).toBe(false);
    expect(rowIcon(3).classList.contains('error')).toBe(true);
    expect(rowIcon(3).classList.contains('success')).toBe(false);
    expect(rowIcon(4).classList.contains('error')).toBe(true);
    expect(rowIcon(4).classList.contains('success')).toBe(false);
  });

  it('all 5 rows render with success style when password is fully valid (value present, no firebasePassword error)', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    password.setValue('Password1!');
    password.setErrors(null);
    password.updateValueAndValidity();
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      const icon = rowIcon(i);
      expect(icon.classList.contains('success')).toBe(true);
      expect(icon.classList.contains('error')).toBe(false);
    }
  });

  it('all 5 rows render neutral when the field has not been touched or dirtied', () => {
    const password = component.form.controls.password;
    password.setValue('Password1!');
    password.setErrors(null);
    password.updateValueAndValidity();
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      const icon = rowIcon(i);
      expect(icon.classList.contains('error')).toBe(false);
      expect(icon.classList.contains('success')).toBe(false);
    }
  });

  it('met rows stay neutral (not green) when the field is touched and only some requirements are met', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    password.setErrors({
      firebasePassword: {
        minLength: false,
        lower: true,
        upper: false,
        number: false,
        special: false,
      },
    });
    fixture.detectChanges();

    expect(rowIcon(0).classList.contains('error')).toBe(true);
    expect(rowIcon(0).classList.contains('success')).toBe(false);
    expect(rowIcon(1).classList.contains('success')).toBe(false);
    expect(rowIcon(1).classList.contains('error')).toBe(false);
    expect(rowIcon(2).classList.contains('error')).toBe(true);
    expect(rowIcon(2).classList.contains('success')).toBe(false);
  });

  it('exposes reactive signals for password state (OnPush-safe)', () => {
    const password = component.form.controls.password;

    expect(component.passwordValue()).toBe('');
    expect(component.passwordTouched()).toBe(false);
    expect(component.passwordValid()).toBe(false);
    expect(component.passwordStatus()).toBe('INVALID');

    password.setValue('abc');
    expect(component.passwordValue()).toBe('abc');
    expect(component.passwordStatus()).toBe('PENDING');
    expect(component.passwordValid()).toBe(false);

    password.setErrors({ firebasePassword: { minLength: false } });
    expect(component.passwordStatus()).toBe('INVALID');
    expect(component.passwordValid()).toBe(false);

    password.setErrors(null);
    password.updateValueAndValidity();
    expect(component.passwordStatus()).toBe('VALID');
    expect(component.passwordValid()).toBe(true);

    password.markAsTouched();
    password.setValue('abcd');
    expect(component.passwordTouched()).toBe(true);
  });

  it('bug: typing a single lowercase letter does not mark all rows as success', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    password.setValue('p');
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      const icon = rowIcon(i);
      expect(icon.classList.contains('success')).toBe(false);
      expect(icon.classList.contains('error')).toBe(false);
    }
  });

  it('during PENDING with touched, no row is danger either (error object not yet set)', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    password.setValue('p');
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      expect(rowIcon(i).classList.contains('error')).toBe(false);
    }
  });

  it('unmet rows are danger and met rows are neutral when status is INVALID and touched', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    password.setValue('p');
    password.setErrors({
      firebasePassword: {
        minLength: false,
        lower: true,
        upper: false,
        number: false,
        special: false,
      },
    });
    fixture.detectChanges();

    expect(rowIcon(0).classList.contains('error')).toBe(true);
    expect(rowIcon(0).classList.contains('success')).toBe(false);
    expect(rowIcon(1).classList.contains('error')).toBe(false);
    expect(rowIcon(1).classList.contains('success')).toBe(false);
    expect(rowIcon(2).classList.contains('error')).toBe(true);
    expect(rowIcon(2).classList.contains('success')).toBe(false);
    expect(rowIcon(3).classList.contains('error')).toBe(true);
    expect(rowIcon(3).classList.contains('success')).toBe(false);
    expect(rowIcon(4).classList.contains('error')).toBe(true);
    expect(rowIcon(4).classList.contains('success')).toBe(false);
  });

  it('all rows are success when status is VALID and touched', () => {
    const password = component.form.controls.password;
    password.markAsTouched();
    password.setValue('Password1!');
    password.setErrors(null);
    password.updateValueAndValidity();
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      expect(rowIcon(i).classList.contains('success')).toBe(true);
      expect(rowIcon(i).classList.contains('error')).toBe(false);
    }
  });

  it('rows stay neutral when not touched even if status is INVALID', () => {
    const password = component.form.controls.password;
    password.setValue('p');
    password.setErrors({ firebasePassword: { minLength: false } });
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      expect(rowIcon(i).classList.contains('error')).toBe(false);
      expect(rowIcon(i).classList.contains('success')).toBe(false);
    }
  });
});
