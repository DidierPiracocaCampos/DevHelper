import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterChip, formatValue } from './filter-chip';
import { AnyFilterField, FilterField } from '../filter.types';

interface DemoEntity {
  name: string;
  secure: boolean;
  createdAt: string;
  status: string;
}

describe('FilterChip', () => {
  let fixture: ComponentFixture<FilterChip>;
  let component: FilterChip;

  const nameField: FilterField<DemoEntity> = {
    key: 'name',
    label: 'Nombre',
    control: 'text',
    ops: ['=='],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterChip],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterChip);
    component = fixture.componentInstance;
  });

  it('renders field label, op and value', () => {
    fixture.componentRef.setInput('field', nameField as unknown as AnyFilterField);
    fixture.componentRef.setInput('value', { key: 'name', op: '==', value: 'foo' });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nombre');
    expect(el.textContent).toContain('==');
    expect(el.textContent).toContain('foo');
  });

  it('emits remove with the field key when close button is clicked', () => {
    fixture.componentRef.setInput('field', nameField as unknown as AnyFilterField);
    fixture.componentRef.setInput('value', { key: 'name', op: '==', value: 'foo' });
    fixture.detectChanges();

    const emitted: string[] = [];
    component.remove.subscribe((k) => emitted.push(k));

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitted).toEqual(['name']);
  });

  describe('formatValue', () => {
    it('formats boolean values as Sí/No', () => {
      const field: AnyFilterField = {
        key: 'secure',
        label: 'Seguro',
        control: 'boolean',
        ops: ['=='],
      };
      expect(formatValue(field, true)).toBe('Sí');
      expect(formatValue(field, false)).toBe('No');
    });

    it('formats date values with toLocaleDateString', () => {
      const field: AnyFilterField = {
        key: 'createdAt',
        label: 'Fecha',
        control: 'date',
        ops: ['=='],
      };
      const d = new Date(2026, 5, 5);
      expect(formatValue(field, d)).toBe(d.toLocaleDateString());
    });

    it('resolves select option labels', () => {
      const field: AnyFilterField = {
        key: 'status',
        label: 'Estado',
        control: 'select',
        ops: ['=='],
        options: [
          { label: 'Abierto', value: 'open' },
          { label: 'Cerrado', value: 'closed' },
        ],
      };
      expect(formatValue(field, 'open')).toBe('Abierto');
    });

    it('falls back to String() for unknown select values', () => {
      const field: AnyFilterField = {
        key: 'status',
        label: 'Estado',
        control: 'select',
        ops: ['=='],
        options: [{ label: 'Abierto', value: 'open' }],
      };
      expect(formatValue(field, 'unknown')).toBe('unknown');
    });
  });
});
