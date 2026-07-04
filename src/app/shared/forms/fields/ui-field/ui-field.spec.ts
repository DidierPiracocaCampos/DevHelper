import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { vi } from 'vitest';
import { UiField } from './ui-field';
import { ErrorMessage } from './error-message';

@Component({
  selector: 'test-text-field',
  imports: [NgTemplateOutlet],
  template: `
    <div class="input input-lg w-full" [class.validator]="isInvalid()">
      <ng-content select="[prefix]" />
      <input
        [id]="inputId()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
      <ng-content select="[suffix]" />
    </div>
    @for (m of errorMessages(); track $index) {
      @if ((errors()?.[m.error()] && isInvalid()) || m.visible()) {
        <ng-container
          [ngTemplateOutlet]="m.template"
          [ngTemplateOutletContext]="{ $implicit: errors()?.[m.error()] }"
        />
      }
    }
  `,
})
class TestTextField extends UiField<string> {
  onInput(event: Event) {
    this.setDirty();
    this.emitValue((event.target as HTMLInputElement).value);
  }
  onBlur() {
    this.emitTouched();
  }
}

describe('UiField', () => {
  let fixture: ComponentFixture<TestTextField>;
  let component: TestTextField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTextField],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTextField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'x');
    fixture.detectChanges();
  });

  it('writeValue updates the value signal', () => {
    component.writeValue('hello');
    expect(component.value()).toBe('hello');
  });

  it('setDisabledState updates the disabled signal', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
  });

  it('input event updates value and notifies onChange', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'foo';
    input.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('foo');
    expect(onChange).toHaveBeenCalledWith('foo');
    expect(component.dirty()).toBe(true);
  });

  it('blur event marks touched and notifies onTouched', () => {
    const onTouched = vi.fn();
    component.registerOnTouched(onTouched);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));

    expect(component.touched()).toBe(true);
    expect(onTouched).toHaveBeenCalled();
  });

  it('isInvalid is true when there are errors and touched', () => {
    component.writeValue('a');
    component.registerOnTouched(() => {});
    component.errors.set({ required: true });
    expect(component.isInvalid()).toBe(false);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    expect(component.isInvalid()).toBe(true);
  });

  it('errorMessages signal is empty when no template is projected', () => {
    expect(component.errorMessages().length).toBe(0);
  });
});

@Component({
  selector: 'test-host',
  imports: [TestTextField, ErrorMessage],
  template: `
    <test-text-field inputId="x">
      <ng-template errorMessage="required" let-error>Required error</ng-template>
    </test-text-field>
  `,
})
class TestHost {}

describe('UiField contentChildren(ErrorMessage)', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('picks up projected <ng-template errorMessage> from the host', () => {
    const field = fixture.debugElement.children[0].componentInstance as TestTextField;
    expect(field.errorMessages().length).toBe(1);
    expect(field.errorMessages()[0].error()).toBe('required');
  });
});

@Component({
  selector: 'test-text-field-cva',
  imports: [NgTemplateOutlet],
  template: `
    <div class="input">
      <input [id]="inputId()" [value]="value()" (input)="onInput($event)" (blur)="onBlur()" />
    </div>
    @for (m of errorMessages(); track $index) {
      @if ((errors()?.[m.error()] && isInvalid()) || m.visible()) {
        <ng-container
          [ngTemplateOutlet]="m.template"
          [ngTemplateOutletContext]="{ $implicit: errors()?.[m.error()] }"
        />
      }
    }
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TestTextFieldCva), multi: true },
  ],
})
class TestTextFieldCva extends UiField<string> {
  override inputId = input.required<string>();
  onInput(event: Event) {
    this.handleInput(event);
  }
  onBlur() {
    this.handleBlur();
  }
}

@Component({
  selector: 'test-host-cva',
  imports: [TestTextFieldCva, ErrorMessage, ReactiveFormsModule],
  template: `
    <test-text-field-cva inputId="x" [formControl]="control">
      <ng-template errorMessage="required" let-error>Required fired</ng-template>
    </test-text-field-cva>
  `,
})
class TestHostCva {
  control = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
}

describe('UiField NgControl sync', () => {
  it('errors signal reflects the FormControl errors when the control is touched and invalid', () => {
    const f = TestBed.createComponent(TestHostCva);
    const c = f.componentInstance;
    f.detectChanges();
    c.control.markAsTouched();
    c.control.updateValueAndValidity();
    f.detectChanges();

    const field = f.debugElement.children[0].componentInstance as TestTextFieldCva;
    expect(field.errors()).toEqual({ required: true });
    expect(field.isInvalid()).toBe(true);
  });
});
