import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import FormRegister from './form-register';
import { Authenticator } from '../../../shared/service/authenticator';
import { Loader } from '../../../shared/service/loader';
import {
  PASSWORD_RULES,
  type PasswordRuleKey,
} from '../../../shared/forms/validators/password-rules';

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

  function rows(): HTMLElement[] {
    const list = fixture.nativeElement.querySelector('ul.list') as HTMLElement;
    return Array.from(list.querySelectorAll('li.list-row')) as HTMLElement[];
  }
  function iconOf(row: HTMLElement): HTMLElement {
    return row.querySelector('span.icon') as HTMLElement;
  }
  function labelOf(row: HTMLElement): string {
    return (row.querySelector('div') as HTMLElement).textContent?.trim() ?? '';
  }
  function rowByKey(key: PasswordRuleKey): HTMLElement {
    return rows()[PASSWORD_RULES.findIndex((r) => r.key === key)];
  }
  function touch() {
    component.form.controls.password.markAsTouched();
    component.onFormFocusOut();
    fixture.detectChanges();
  }

  it('renderiza 5 filas con etiquetas correctas', () => {
    fixture.detectChanges();
    const r = rows();
    expect(r.length).toBe(5);
    expect(r.map(labelOf)).toEqual(PASSWORD_RULES.map((rule) => rule.label));
  });

  it('antes de blur con password vacio: 5 filas neutras (remove)', () => {
    const password = component.form.controls.password;
    password.setValue('');
    fixture.detectChanges();
    for (const row of rows()) {
      const icon = iconOf(row);
      expect(icon.classList.contains('success')).toBe(false);
      expect(icon.classList.contains('error')).toBe(false);
      expect(icon.textContent?.trim()).toBe('remove');
    }
  });

  it('antes de blur con password valida completa: 5 filas verde/check inmediatamente', () => {
    const password = component.form.controls.password;
    password.setValue('Abcdef1!');
    fixture.detectChanges();
    for (const row of rows()) {
      const icon = iconOf(row);
      expect(icon.classList.contains('success')).toBe(true);
      expect(icon.classList.contains('error')).toBe(false);
      expect(icon.textContent?.trim()).toBe('check');
    }
  });

  it('antes de blur "p": lower en verde, los otros 4 neutros (no rojo) - verde individual sin espera', () => {
    const password = component.form.controls.password;
    password.setValue('p');
    fixture.detectChanges();
    for (const row of rows()) {
      const icon = iconOf(row);
      expect(icon.classList.contains('error')).toBe(false);
    }
    const lowerIcon = iconOf(rowByKey('lower'));
    expect(lowerIcon.classList.contains('success')).toBe(true);
    expect(lowerIcon.textContent?.trim()).toBe('check');
    for (const rule of PASSWORD_RULES) {
      if (rule.key === 'lower') continue;
      const icon = iconOf(rowByKey(rule.key));
      expect(icon.classList.contains('success')).toBe(false);
      expect(icon.textContent?.trim()).toBe('remove');
    }
  });

  it('tras blur con password valida: 5 filas success/check', () => {
    const password = component.form.controls.password;
    password.setValue('Abcdef1!');
    touch();
    for (const row of rows()) {
      const icon = iconOf(row);
      expect(icon.classList.contains('success')).toBe(true);
      expect(icon.classList.contains('error')).toBe(false);
      expect(icon.textContent?.trim()).toBe('check');
    }
  });

  it('bug fix: una sola letra minuscula NO marca todas como success', () => {
    const password = component.form.controls.password;
    password.setValue('p');
    touch();

    const icons = rows().map(iconOf);
    const successCount = icons.filter((i) => i.classList.contains('success')).length;
    expect(successCount).toBe(1);
    const lowerIcon = iconOf(rowByKey('lower'));
    expect(lowerIcon.classList.contains('success')).toBe(true);
    expect(lowerIcon.textContent?.trim()).toBe('check');

    for (const rule of PASSWORD_RULES) {
      if (rule.key === 'lower') continue;
      const icon = iconOf(rowByKey(rule.key));
      expect(icon.classList.contains('success')).toBe(false);
      expect(icon.classList.contains('error')).toBe(true);
      expect(icon.textContent?.trim()).toBe('error');
    }
  });

  it('tras blur "Abc1": cumplidas en verde (lower, upper, number), no-cumplidas en rojo (minLength, special)', () => {
    const password = component.form.controls.password;
    password.setValue('Abc1');
    touch();

    for (const rule of PASSWORD_RULES) {
      const icon = iconOf(rowByKey(rule.key));
      if (rule.test('Abc1')) {
        expect(icon.classList.contains('success')).toBe(true);
        expect(icon.classList.contains('error')).toBe(false);
      } else {
        expect(icon.classList.contains('success')).toBe(false);
        expect(icon.classList.contains('error')).toBe(true);
      }
    }
  });

  it('vacio + touched: 5 filas en rojo (error)', () => {
    touch();
    for (const row of rows()) {
      const icon = iconOf(row);
      expect(icon.classList.contains('error')).toBe(true);
      expect(icon.classList.contains('success')).toBe(false);
    }
  });

  it('ruleStates se actualiza por keystroke', () => {
    const password = component.form.controls.password;
    password.setValue('');
    fixture.detectChanges();
    expect(component.ruleStates().lower).toBe(false);

    password.setValue('a');
    fixture.detectChanges();
    expect(component.ruleStates().lower).toBe(true);
    expect(component.ruleStates().upper).toBe(false);

    password.setValue('A');
    fixture.detectChanges();
    expect(component.ruleStates().upper).toBe(true);
    expect(component.ruleStates().minLength).toBe(false);
  });

  it('passwordTouched reacciona al blur del formulario', () => {
    expect(component.passwordTouched()).toBe(false);
    touch();
    expect(component.passwordTouched()).toBe(true);
  });

  it('passwordValue signal refleja setValue', () => {
    expect(component.passwordValue()).toBe('');
    component.form.controls.password.setValue('abc');
    expect(component.passwordValue()).toBe('abc');
    component.form.controls.password.setValue('xyz');
    expect(component.passwordValue()).toBe('xyz');
  });

  it('no flicker VALID->INVALID: status sincrono en setValue', () => {
    const password = component.form.controls.password;
    password.setValue('p');
    expect(password.status).toBe('INVALID');
    password.setValue('Abcdef1!');
    expect(password.status).toBe('VALID');
    password.setValue('Abcdef1');
    expect(password.status).toBe('INVALID');
  });
});
