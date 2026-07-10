import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiLabel as _UiLabel } from '../ui-field/ui-field';
import { UiSelectField } from './ui-select-field';

interface Option {
  label: string;
  value: string;
}

const options: ReadonlyArray<Option> = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Hecho', value: 'done' },
];

describe('UiSelectField', () => {
  let fixture: ComponentFixture<UiSelectField>;
  let component: UiSelectField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSelectField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSelectField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'status');
    fixture.componentRef.setInput('options', options);
  });

  it('renders a <select> with the provided options', () => {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const optEls = Array.from(select.querySelectorAll('option')) as HTMLOptionElement[];
    expect(optEls.map((o) => o.value)).toEqual(['pending', 'done']);
    expect(optEls.map((o) => o.textContent?.trim())).toEqual(['Pendiente', 'Hecho']);
  });

  it('is transparent so the wrapper provides the background (no own bg-base-200)', () => {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.classList.contains('bg-base-200')).toBe(false);
    expect(select.classList.contains('select-ghost')).toBe(true);
  });

  it('does not add its own border (the wrapper provides it)', () => {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.classList.contains('select-bordered')).toBe(false);
    expect(select.classList.contains('select-ghost')).toBe(true);
  });

  it('does not add its own focus outline (the wrapper provides it)', () => {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.classList.contains('outline-none')).toBe(true);
  });

  it('writeValue selects the matching option', () => {
    component.writeValue('done');
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('done');
  });

  it('emits value on change and marks dirty', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'done';
    select.dispatchEvent(new Event('change'));

    expect(component.value()).toBe('done');
    expect(onChange).toHaveBeenCalledWith('done');
    expect(component.dirty()).toBe(true);
  });

  it('disabled state disables the select', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it('renders a placeholder as the first option when provided', () => {
    fixture.componentRef.setInput('placeholder', 'Seleccionar…');
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    const first = select.querySelector('option') as HTMLOptionElement;
    expect(first.value).toBe('');
    expect(first.textContent?.trim()).toBe('Seleccionar…');
  });
});

@Component({
  imports: [UiSelectField, _UiLabel],
  template: `
    <ui-select-field inputId="status" [options]="opts">
      <ng-template uiLabel>Estado</ng-template>
    </ui-select-field>
  `,
})
class _HostWithUiLabel {
  opts = options;
}

describe('UiSelectField with uiLabel contentChild', () => {
  let fixture: ComponentFixture<_HostWithUiLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [_HostWithUiLabel],
    }).compileComponents();

    fixture = TestBed.createComponent(_HostWithUiLabel);
    fixture.detectChanges();
  });

  it('wraps the uiLabel template inside a <label class="label-field">', () => {
    const label = fixture.nativeElement.querySelector('label.label-field') as HTMLLabelElement;
    expect(label).not.toBeNull();
    expect(label.textContent?.trim()).toBe('Estado');
  });

  it('associates the label to the select via for=inputId', () => {
    const label = fixture.nativeElement.querySelector('label.label-field') as HTMLLabelElement;
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(label.getAttribute('for')).toBe('status');
    expect(select.id).toBe('status');
  });
});
