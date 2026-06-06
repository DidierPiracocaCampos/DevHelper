import { ComponentFixture, TestBed } from '@angular/core/testing';
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
