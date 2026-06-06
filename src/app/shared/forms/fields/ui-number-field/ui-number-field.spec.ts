import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiNumberField } from './ui-number-field';

describe('UiNumberField', () => {
  let fixture: ComponentFixture<UiNumberField>;
  let component: UiNumberField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiNumberField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiNumberField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'n');
    fixture.detectChanges();
  });

  it('parses integer values', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '42';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('parses decimal values', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '3.14';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith(3.14);
  });

  it('emits null for empty string', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('reflects min/max/step', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('step', 5);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
    expect(input.step).toBe('5');
  });
});
