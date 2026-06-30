import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiLabel as _UiLabel } from '../ui-field/ui-field';
import { UiTextField } from './ui-text-field';

describe('UiTextField', () => {
  let fixture: ComponentFixture<UiTextField>;
  let component: UiTextField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTextField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTextField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'x');
  });

  it('renders with default type text', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('reflects type input reactively', () => {
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('reflects placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'enter name');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('enter name');
  });

  it('emits value on input and marks dirty', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'foo';
    input.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('foo');
    expect(onChange).toHaveBeenCalledWith('foo');
    expect(component.dirty()).toBe(true);
  });
});

@Component({
  imports: [UiTextField, _UiLabel],
  template: `
    <ui-text-field inputId="event-title">
      <ng-template uiLabel>Título</ng-template>
    </ui-text-field>
  `,
})
class _HostWithUiLabel {}

describe('UiTextField with uiLabel contentChild', () => {
  let fixture: ComponentFixture<_HostWithUiLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [_HostWithUiLabel],
    }).compileComponents();

    fixture = TestBed.createComponent(_HostWithUiLabel);
    fixture.detectChanges();
  });

  it('wraps the uiLabel template inside a <label class="label-field">', () => {
    const label = fixture.nativeElement.querySelector(
      'label.label-field',
    ) as HTMLLabelElement | null;
    expect(label).not.toBeNull();
    expect(label?.textContent?.trim()).toBe('Título');
  });

  it('associates the label to the input via for=inputId', () => {
    const label = fixture.nativeElement.querySelector('label.label-field') as HTMLLabelElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(label.getAttribute('for')).toBe('event-title');
    expect(input.id).toBe('event-title');
  });
});
