import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { UiListItem } from './item-list';

@Component({
  selector: 'test-host-leading',
  standalone: true,
  imports: [UiListItem],
  template: `
    <ui-list-item label="demo" sub="info"><span leading>PDF</span></ui-list-item>
  `,
})
class TestHostLeadingComponent {}

@Component({
  selector: 'test-host-plain',
  standalone: true,
  imports: [UiListItem],
  template: `
    <ui-list-item label="demo" sub="info"></ui-list-item>
  `,
})
class TestHostPlainComponent {}

describe('UiListItem', () => {
  let component: UiListItem;
  let fixture: ComponentFixture<UiListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(UiListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('UiListItem - leading slot', () => {
  let fixtureLeading: ComponentFixture<TestHostLeadingComponent>;
  let fixturePlain: ComponentFixture<TestHostPlainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostLeadingComponent, TestHostPlainComponent],
    }).compileComponents();
    fixtureLeading = TestBed.createComponent(TestHostLeadingComponent);
    fixtureLeading.detectChanges();
    fixturePlain = TestBed.createComponent(TestHostPlainComponent);
    fixturePlain.detectChanges();
  });

  it('proyecta contenido en [leading] antes del label', () => {
    const leading = fixtureLeading.nativeElement.querySelector('.item-list-leading');
    expect(leading).toBeTruthy();
    expect(leading.textContent.trim()).toBe('PDF');
    const label = fixtureLeading.nativeElement.querySelector('.item-list-label');
    expect(label.textContent).toContain('demo');
  });

  it('sin [leading] el row se renderiza igual que antes (regresion)', () => {
    const leading = fixturePlain.nativeElement.querySelector('.item-list-leading');
    expect(leading).toBeTruthy();
    expect(leading.children.length).toBe(0);
    const label = fixturePlain.nativeElement.querySelector('.item-list-label');
    expect(label.textContent).toContain('demo');
  });
});
