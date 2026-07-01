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

@Component({
  selector: 'test-host-primary',
  standalone: true,
  imports: [UiListItem],
  template: `
    <ui-list-item severity="primary" label="demo" sub="info"></ui-list-item>
  `,
})
class TestHostPrimaryComponent {}

@Component({
  selector: 'test-host-secondary',
  standalone: true,
  imports: [UiListItem],
  template: `
    <ui-list-item severity="secondary" label="demo" sub="info"></ui-list-item>
  `,
})
class TestHostSecondaryComponent {}

@Component({
  selector: 'test-host-accent',
  standalone: true,
  imports: [UiListItem],
  template: `
    <ui-list-item severity="accent" label="demo" sub="info"></ui-list-item>
  `,
})
class TestHostAccentComponent {}

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

describe('UiListItem - color por severity', () => {
  let fixturePrimary: ComponentFixture<TestHostPrimaryComponent>;
  let fixtureSecondary: ComponentFixture<TestHostSecondaryComponent>;
  let fixtureAccent: ComponentFixture<TestHostAccentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostPrimaryComponent, TestHostSecondaryComponent, TestHostAccentComponent],
    }).compileComponents();
    fixturePrimary = TestBed.createComponent(TestHostPrimaryComponent);
    fixturePrimary.detectChanges();
    fixtureSecondary = TestBed.createComponent(TestHostSecondaryComponent);
    fixtureSecondary.detectChanges();
    fixtureAccent = TestBed.createComponent(TestHostAccentComponent);
    fixtureAccent.detectChanges();
  });

  it('primary: expone --item-list-text-color apuntando a base-100', () => {
    const row = fixturePrimary.nativeElement.querySelector('.item-list-row');
    const value = getComputedStyle(row).getPropertyValue('--item-list-text-color').trim();
    expect(value).toContain('base-100');
  });

  it('secondary: expone --item-list-text-color apuntando a base-content', () => {
    const row = fixtureSecondary.nativeElement.querySelector('.item-list-row');
    const value = getComputedStyle(row).getPropertyValue('--item-list-text-color').trim();
    expect(value).toContain('base-content');
  });

  it('accent: expone --item-list-text-color apuntando a base-content', () => {
    const row = fixtureAccent.nativeElement.querySelector('.item-list-row');
    const value = getComputedStyle(row).getPropertyValue('--item-list-text-color').trim();
    expect(value).toContain('base-content');
  });

  it('primary y secondary producen colores opuestos', () => {
    const rowPrimary = fixturePrimary.nativeElement.querySelector('.item-list-row');
    const rowSecondary = fixtureSecondary.nativeElement.querySelector('.item-list-row');
    const valuePrimary = getComputedStyle(rowPrimary)
      .getPropertyValue('--item-list-text-color')
      .trim();
    const valueSecondary = getComputedStyle(rowSecondary)
      .getPropertyValue('--item-list-text-color')
      .trim();
    expect(valuePrimary).not.toBe(valueSecondary);
  });
});
