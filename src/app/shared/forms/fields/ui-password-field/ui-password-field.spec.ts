import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiPasswordField } from './ui-password-field';

describe('UiPasswordField', () => {
  let fixture: ComponentFixture<UiPasswordField>;
  let component: UiPasswordField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPasswordField],
    }).compileComponents();

    fixture = TestBed.createComponent(UiPasswordField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'pwd');
    fixture.detectChanges();
  });

  it('starts with type=password and aria-pressed=false', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Mostrar contraseña');
  });

  it('togglePassword switches type to text and aria-pressed=true', () => {
    component.togglePassword();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Ocultar contraseña');
  });

  it('togglePassword via Space key works', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(component.showPassword()).toBe(true);
  });

  it('togglePassword via Enter key works', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(component.showPassword()).toBe(true);
  });

  it('emits value on input', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'secret';
    input.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('secret');
    expect(onChange).toHaveBeenCalledWith('secret');
  });
});
