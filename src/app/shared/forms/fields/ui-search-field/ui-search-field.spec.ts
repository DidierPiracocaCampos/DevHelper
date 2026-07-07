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
    expect(fixture.nativeElement.querySelector('button[aria-label="Limpiar búsqueda"]')).toBeNull();
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

  it('emits search on enter key with current value', () => {
    const search = vi.fn();
    component.search.subscribe(search);
    component.writeValue('hello');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(search).toHaveBeenCalledWith('hello');
  });

  it('emits search when search button is clicked', () => {
    const search = vi.fn();
    component.search.subscribe(search);
    component.writeValue('hello');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const searchBtn = Array.from(buttons).find(
      (b) => (b as HTMLButtonElement).getAttribute('aria-label') === 'Buscar',
    ) as HTMLButtonElement | undefined;
    expect(searchBtn).toBeTruthy();
    searchBtn!.click();

    expect(search).toHaveBeenCalledWith('hello');
  });

  it('search button is disabled when value is empty', () => {
    const search = vi.fn();
    component.search.subscribe(search);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const searchBtn = Array.from(buttons).find(
      (b) => (b as HTMLButtonElement).getAttribute('aria-label') === 'Buscar',
    ) as HTMLButtonElement | undefined;
    expect(searchBtn).toBeTruthy();
    expect(searchBtn!.disabled).toBe(true);
  });

  it('does not emit search when value is empty even if clicked', () => {
    const search = vi.fn();
    component.search.subscribe(search);
    fixture.detectChanges();

    // The search button is rendered (disabled) but clicking it must not emit.
    const searchBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Buscar"]',
    ) as HTMLButtonElement | null;
    expect(searchBtn).toBeTruthy();
    expect(searchBtn!.disabled).toBe(true);
    searchBtn!.click();
    expect(search).not.toHaveBeenCalled();
  });

  it('does not emit search when disabled', () => {
    const search = vi.fn();
    component.search.subscribe(search);
    component.writeValue('hello');
    component.setDisabledState(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(search).not.toHaveBeenCalled();
  });
});
