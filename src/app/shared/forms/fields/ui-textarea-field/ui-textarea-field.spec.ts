import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTextareaField } from './ui-textarea-field';

describe('UiTextareaField', () => {
  let fixture: ComponentFixture<UiTextareaField>;
  let component: UiTextareaField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTextareaField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTextareaField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'ta');
    fixture.detectChanges();
  });

  it('renders a textarea', () => {
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
  });

  it('reflects rows input', () => {
    fixture.componentRef.setInput('rows', 6);
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.rows).toBe(6);
  });

  it('shows character counter when maxlength is set', () => {
    fixture.componentRef.setInput('maxlength', 100);
    component.writeValue('hi');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('2 / 100');
  });

  it('hides counter when no maxlength', () => {
    expect(fixture.nativeElement.textContent).not.toContain('/');
  });

  it('emits value on input', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    const ta = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    ta.value = 'hello';
    ta.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('hello');
  });
});
