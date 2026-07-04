import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterModal } from './filter-modal';
import { FilterSchema } from '../filter.types';

interface DemoEntity {
  name: string;
  size: number;
  secure: boolean;
}

const schema: FilterSchema<DemoEntity> = {
  entity: 'demo',
  fields: [
    { key: 'name', label: 'Nombre', control: 'text', ops: ['==', '!='] },
    { key: 'size', label: 'Tamaño', control: 'number', ops: ['==', '>'] },
    { key: 'secure', label: 'Seguro', control: 'boolean', ops: ['=='] },
  ],
};

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
  };
}

describe('FilterModal', () => {
  let fixture: ComponentFixture<FilterModal<DemoEntity>>;
  let component: FilterModal<DemoEntity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterModal],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterModal<DemoEntity>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('schema', schema);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
  });

  it('emits apply with the active filters when Aplicar is clicked', () => {
    component.onToggle('name', true);
    component.onValueChange('name', 'foo');
    component.onToggle('size', true);
    component.onValueChange('size', 10);

    const applied: unknown[] = [];
    component.apply.subscribe((f) => applied.push(f));

    component.onApply();

    expect(applied.length).toBe(1);
    expect(applied[0]).toEqual([
      { key: 'name', op: '==', value: 'foo' },
      { key: 'size', op: '==', value: 10 },
    ]);
    expect(component.isOpen()).toBe(false);
  });

  it('omits entries that are not enabled or empty', () => {
    component.onToggle('name', true);
    component.onValueChange('name', 'foo');
    component.onToggle('size', false);
    component.onValueChange('size', '');
    component.onValueChange('secure', true);
    component.onToggle('secure', false);

    const applied: unknown[] = [];
    component.apply.subscribe((f) => applied.push(f));

    component.onApply();

    expect(applied[0]).toEqual([{ key: 'name', op: '==', value: 'foo' }]);
  });

  it('emits clear when Limpiar is clicked and closes the modal', () => {
    const cleared: number[] = [];
    component.clear.subscribe(() => cleared.push(1));

    component.onClear();

    expect(cleared.length).toBe(1);
    expect(component.isOpen()).toBe(false);
  });

  it('shows a human-readable Spanish label for fields with a single operator', () => {
    const tagsSchema: FilterSchema<DemoEntity> = {
      entity: 'demo',
      fields: [{ key: 'name', label: 'Etiqueta', control: 'text', ops: ['array-contains'] }],
    };
    fixture.componentRef.setInput('schema', tagsSchema);
    fixture.detectChanges();

    const opLabel = fixture.nativeElement.querySelector(
      '[data-testid="op-label-name"]',
    ) as HTMLElement | null;

    expect(opLabel).not.toBeNull();
    expect(opLabel?.textContent?.trim()).toBe('contiene');
  });

  it('uses human-readable Spanish labels in the multi-operator select options', () => {
    const opSelect = fixture.nativeElement.querySelector(
      'ui-select-field select',
    ) as HTMLSelectElement | null;
    expect(opSelect).not.toBeNull();
    const optTexts = Array.from(opSelect!.querySelectorAll('option')).map((o) =>
      o.textContent?.trim(),
    );
    expect(optTexts).toEqual(expect.arrayContaining(['igual a', 'diferente de']));
  });
});
