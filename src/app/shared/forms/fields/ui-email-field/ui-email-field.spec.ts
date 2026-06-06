import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiEmailField } from './ui-email-field';

describe('UiEmailField', () => {
  let fixture: ComponentFixture<UiEmailField>;
  let component: UiEmailField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiEmailField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiEmailField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'email');
    fixture.detectChanges();
  });

  it('renders type=email with default placeholder', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('mail@site.com');
  });

  it('shows default label', () => {
    expect(fixture.nativeElement.textContent).toContain('Correo electrónico:');
  });

  it('overrides placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'user@example.com');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('user@example.com');
  });

  it('emits value on input', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'a@b.c';
    input.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('a@b.c');
    expect(onChange).toHaveBeenCalledWith('a@b.c');
  });
});
