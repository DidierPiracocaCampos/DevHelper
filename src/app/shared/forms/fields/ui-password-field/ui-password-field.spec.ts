import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UiPasswordField } from './ui-password-field';
import { ErrorMessage } from '../ui-field/error-message';

describe('UiPasswordField', () => {
  let fixture: ComponentFixture<UiPasswordField>;
  let component: UiPasswordField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPasswordField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiPasswordField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'pwd');
    fixture.detectChanges();
  });

  it('starts with type=password and aria-pressed=false', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Mostrar contraseña');
  });

  it('togglePassword switches type to text and aria-pressed=true', () => {
    component.togglePassword();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Ocultar contraseña');
  });

  it('togglePassword via Space key works', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(component.showPassword()).toBe(true);
  });

  it('togglePassword via Enter key works', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(component.showPassword()).toBe(true);
  });

  it('emits value on input', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'secret';
    input.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('secret');
    expect(onChange).toHaveBeenCalledWith('secret');
  });
});

@Component({
  selector: 'test-password-host-literal',
  imports: [ReactiveFormsModule, UiPasswordField, ErrorMessage],
  template: `
    <ui-password-field inputId="pwd" [formControl]="control">
      <ng-template errorMessage="firebasePassword" [visible]="true" let-error>
        <p class="req">requirements-list</p>
      </ng-template>
    </ui-password-field>
  `,
})
class TestPasswordHostLiteral {
  control = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  selector: 'test-password-host-visible',
  imports: [ReactiveFormsModule, UiPasswordField, ErrorMessage],
  template: `
    <ui-password-field inputId="pwd" [formControl]="control">
      <ng-template errorMessage="firebasePassword" [visible]="visible" let-error>
        <p class="req">requirements-list</p>
      </ng-template>
    </ui-password-field>
  `,
})
class TestPasswordHostVisible {
  control = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  visible = true;
}

describe('UiPasswordField with projected error template', () => {
  it('renders the projected <ng-template errorMessage="firebasePassword"> when errors are set and field is touched', () => {
    @Component({
      selector: 'test-password-host-errors',
      imports: [ReactiveFormsModule, UiPasswordField, ErrorMessage],
      template: `
        <ui-password-field inputId="pwd" [formControl]="control">
          <ng-template errorMessage="firebasePassword" let-error>
            <p class="req">requirements-list</p>
          </ng-template>
        </ui-password-field>
      `,
    })
    class TestPasswordHostErrors {
      control = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      });
    }

    const f = TestBed.createComponent(TestPasswordHostErrors);
    const c = f.componentInstance;
    f.detectChanges();
    c.control.markAsTouched();
    c.control.setErrors({ firebasePassword: { minLength: false } });
    f.detectChanges();

    const html = f.nativeElement as HTMLElement;
    expect(html.querySelector('.req')).toBeTruthy();
  });

  it('renders the projected <ng-template errorMessage="firebasePassword" [visible]="true"> from the start (literal)', () => {
    const f = TestBed.createComponent(TestPasswordHostLiteral);
    f.detectChanges();
    const html = f.nativeElement as HTMLElement;
    expect(html.querySelector('.req')).toBeTruthy();
  });

  it('renders the projected <ng-template errorMessage="firebasePassword" [visible]="true"> from the start (expression)', () => {
    const f = TestBed.createComponent(TestPasswordHostVisible);
    f.detectChanges();
    const html = f.nativeElement as HTMLElement;
    expect(html.querySelector('.req')).toBeTruthy();
  });
});
