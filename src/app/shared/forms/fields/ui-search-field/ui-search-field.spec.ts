import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSearchField } from './ui-search-field';

describe('UiSearchField', () => {
  let fixture: ComponentFixture<UiSearchField>;
  let component: UiSearchField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSearchField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSearchField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'q');
    fixture.detectChanges();
  });

  it('hides clear button when value is empty', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows clear button when value is set', () => {
    component.writeValue('hello');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('clear() resets value to empty and notifies', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    component.writeValue('hello');

    component.clear();

    expect(component.value()).toBe('');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('hides clear button when disabled', () => {
    component.writeValue('hello');
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('emits value on input', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'foo';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('foo');
  });
});
