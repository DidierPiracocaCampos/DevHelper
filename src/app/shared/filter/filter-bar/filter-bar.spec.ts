import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FilterBar } from './filter-bar';
import { FilterService } from '../filter.service';
import { FilterSchema, ActiveFilters } from '../filter.types';

interface DemoEntity {
  name: string;
  size: number;
  category: string;
}

const demoSchema: FilterSchema<DemoEntity> = {
  entity: 'demo',
  fields: [
    { key: 'name', label: 'Nombre', control: 'text', ops: ['==', '!='] },
    { key: 'size', label: 'Tamaño', control: 'number', ops: ['==', '>'] },
    { key: 'category', label: 'Categoría', control: 'text', ops: ['=='] },
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

describe('FilterBar', () => {
  let fixture: ComponentFixture<FilterBar<DemoEntity>>;
  let component: FilterBar<DemoEntity>;
  let service: FilterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBar],
    }).compileComponents();

    fixture = TestBed.createComponent<FilterBar<DemoEntity>>(FilterBar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('schema', demoSchema);
    service = TestBed.inject(FilterService);
    service.reset();
    fixture.detectChanges();
  });

  it('renders the filter trigger (only the filter icon, no text label)', () => {
    const trigger = fixture.nativeElement.querySelector('[data-testid="filter-trigger"]');
    expect(trigger).not.toBeNull();
    const text = (trigger as HTMLElement).textContent?.trim() ?? '';
    expect(text).not.toContain('Filtros');
    expect(text).not.toContain('Filters');
  });

  it('renders no chips anywhere in the bar', () => {
    const chips = fixture.nativeElement.querySelectorAll('filter-chip');
    expect(chips.length).toBe(0);

    service.apply(demoSchema, [
      { key: 'name', op: '==', value: 'foo' },
      { key: 'category', op: '==', value: 'work' },
    ]);
    fixture.detectChanges();

    const chipsAfter = fixture.nativeElement.querySelectorAll('filter-chip');
    expect(chipsAfter.length).toBe(0);
  });

  it('opens the modal when the trigger is clicked', () => {
    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="filter-trigger"]',
    ) as HTMLElement;
    const innerButton = trigger.querySelector('button') as HTMLButtonElement;
    innerButton.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
  });

  it('emits apply with the new filters when the modal applies', () => {
    const emitted: ActiveFilters[] = [];
    component.apply.subscribe((f) => emitted.push(f));

    component.onApply([
      { key: 'name', op: '==', value: 'foo' },
      { key: 'category', op: '==', value: 'work' },
    ]);

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual([
      { key: 'name', op: '==', value: 'foo' },
      { key: 'category', op: '==', value: 'work' },
    ]);
  });

  it('applies the filters to the service state when the modal applies', () => {
    const draft: ActiveFilters = [{ key: 'name', op: '==', value: 'foo' }];
    component.onApply(draft);
    expect(service.state()).toEqual(draft);
  });

  it('emits clear and resets the service when the modal clears', () => {
    service.apply(demoSchema, [{ key: 'name', op: '==', value: 'foo' }]);
    let clearEmitted = false;
    component.clear.subscribe(() => (clearEmitted = true));

    component.onClear();

    expect(clearEmitted).toBe(true);
    expect(service.state()).toEqual([]);
  });

  it('closes the modal after apply or clear', () => {
    component.isOpen.set(true);
    component.onApply([{ key: 'name', op: '==', value: 'foo' }]);
    expect(component.isOpen()).toBe(false);

    component.isOpen.set(true);
    component.onClear();
    expect(component.isOpen()).toBe(false);
  });

  it('exposes the active filter count via a count signal', () => {
    expect(component.count()).toBe(0);
    service.apply(demoSchema, [
      { key: 'name', op: '==', value: 'foo' },
      { key: 'category', op: '==', value: 'work' },
    ]);
    expect(component.count()).toBe(2);
  });

  it('does not render a count badge when the filter state is empty', () => {
    const badge = fixture.nativeElement.querySelector('[data-testid="filter-count"]');
    expect(badge).toBeNull();
  });

  it('renders a count badge with the number of active filters', () => {
    service.apply(demoSchema, [
      { key: 'name', op: '==', value: 'foo' },
      { key: 'size', op: '>', value: 10 },
      { key: 'category', op: '==', value: 'work' },
    ]);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('[data-testid="filter-count"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe('3');
  });
});
