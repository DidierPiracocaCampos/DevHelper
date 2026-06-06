import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiPinField } from './ui-pin-field';

describe('UiPinField', () => {
  let fixture: ComponentFixture<UiPinField>;
  let component: UiPinField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPinField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiPinField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'pin');
    fixture.componentRef.setInput('length', 4);
    fixture.detectChanges();
  });

  it('renders length digits', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  it('reflects length input dynamically', () => {
    fixture.componentRef.setInput('length', 6);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(6);
  });

  it('writeValue fills digits', () => {
    component.writeValue('1234');
    fixture.detectChanges();
    expect(component.digits()).toEqual(['1', '2', '3', '4']);
  });

  it('writeValue handles shorter values', () => {
    component.writeValue('12');
    fixture.detectChanges();
    expect(component.digits()).toEqual(['1', '2', '', '']);
  });

  it('onInputNumber updates a digit and emits value', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    const input = fixture.nativeElement.querySelectorAll('input')[0] as HTMLInputElement;
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    expect(component.digits()[0]).toBe('5');
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('strips non-digits on input', () => {
    const input = fixture.nativeElement.querySelectorAll('input')[0] as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    expect(component.digits()[0]).toBe('');
  });

  it('onPaste fills multiple digits up to length', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => '12345' },
    });
    const firstInput = fixture.nativeElement.querySelectorAll('input')[0] as HTMLInputElement;
    firstInput.dispatchEvent(event);
    expect(component.digits()).toEqual(['1', '2', '3', '4']);
  });

  it('emits touched on focusout', () => {
    const onTouched = vi.fn();
    component.registerOnTouched(onTouched);
    const input = fixture.nativeElement.querySelectorAll('input')[0] as HTMLInputElement;
    input.dispatchEvent(new Event('focusout'));
    expect(onTouched).toHaveBeenCalled();
  });
});
