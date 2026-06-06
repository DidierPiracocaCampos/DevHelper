import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgTemplateOutlet } from '@angular/common';
import { vi } from 'vitest';
import { UiField } from './ui-field';

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
