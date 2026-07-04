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

  function touchAndFocusOut() {
    component.form.controls.password.markAsTouched();
    component.onFormFocusOut();
    fixture.detectChanges();
  }

  it('all 5 rows render with danger style when password is empty (default state, required fails)', () => {
    touchAndFocusOut();

    for (let i = 0; i < 5; i++) {
      const icon = rowIcon(i);
      expect(icon.classList.contains('error')).toBe(true);
      expect(icon.classList.contains('success')).toBe(false);
    }
  });

  it('bug fix: typing a single lowercase letter does not mark all rows as success', () => {
    const password = component.form.controls.password;
    touchAndFocusOut();
    password.setValue('p');
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      const icon = rowIcon(i);
      expect(icon.classList.contains('success')).toBe(false);
      expect(icon.classList.contains('error')).toBe(false);
    }
  });

  it('during PENDING (after typing, before async resolves), no row is danger either', () => {
    const password = component.form.controls.password;
    touchAndFocusOut();
    password.setValue('p');
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      expect(rowIcon(i).classList.contains('error')).toBe(false);
    }
  });

  it('unmet rows are danger and met rows are neutral when INVALID (set via setErrors)', () => {
    const password = component.form.controls.password;
    touchAndFocusOut();
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
    expect(rowIcon(1).classList.contains('error')).toBe(false);
    expect(rowIcon(1).classList.contains('success')).toBe(false);
    expect(rowIcon(2).classList.contains('error')).toBe(true);
    expect(rowIcon(3).classList.contains('error')).toBe(true);
    expect(rowIcon(4).classList.contains('error')).toBe(true);
  });

  it('rows stay neutral when not touched even if status is INVALID', () => {
    const password = component.form.controls.password;
    password.setErrors({ firebasePassword: { minLength: false } });
    password.updateValueAndValidity();
    fixture.detectChanges();

    for (let i = 0; i < 5; i++) {
      expect(rowIcon(i).classList.contains('error')).toBe(false);
      expect(rowIcon(i).classList.contains('success')).toBe(false);
    }
  });

  it('passwordStatus signal reflects INVALID transitions synchronously', () => {
    const password = component.form.controls.password;

    expect(component.passwordStatus()).toBe('INVALID');
    expect(component.passwordValid()).toBe(false);

    password.setErrors({ firebasePassword: { minLength: false } });
    password.updateValueAndValidity();
    expect(component.passwordStatus()).toBe('INVALID');
    expect(component.passwordValid()).toBe(false);

    password.setErrors({ required: true });
    password.updateValueAndValidity();
    expect(component.passwordStatus()).toBe('INVALID');
    expect(component.passwordValid()).toBe(false);
  });

  it('passwordValue signal updates on setValue', () => {
    expect(component.passwordValue()).toBe('');
    component.form.controls.password.setValue('abc');
    expect(component.passwordValue()).toBe('abc');
    component.form.controls.password.setValue('xyz');
    expect(component.passwordValue()).toBe('xyz');
  });

  it('passwordTouched signal updates on form focus out', () => {
    expect(component.passwordTouched()).toBe(false);
    touchAndFocusOut();
    expect(component.passwordTouched()).toBe(true);
  });
});
