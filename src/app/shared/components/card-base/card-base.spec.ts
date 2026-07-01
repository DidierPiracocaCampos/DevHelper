import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiCard } from './card-base';

describe('UiCard', () => {
  let component: UiCard;
  let fixture: ComponentFixture<UiCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UiCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('default dark theme applies bg-base-100 to the outer card', () => {
    fixture.detectChanges();
    const cardEl: HTMLElement = fixture.nativeElement.querySelector('.card');
    const bodyEl: HTMLElement = fixture.nativeElement.querySelector('.card-body');
    expect(cardEl.classList.contains('bg-base-100')).toBe(true);
    expect(bodyEl.classList.contains('bg-base-100')).toBe(false);
  });

  it('theme="light" applies bg-base-content to the outer card, not card-body', () => {
    fixture.componentRef.setInput('theme', 'light');
    fixture.detectChanges();
    const cardEl: HTMLElement = fixture.nativeElement.querySelector('.card');
    const bodyEl: HTMLElement = fixture.nativeElement.querySelector('.card-body');
    expect(cardEl.classList.contains('bg-base-content')).toBe(true);
    expect(cardEl.classList.contains('text-base-100')).toBe(true);
    expect(bodyEl.classList.contains('bg-base-content')).toBe(false);
    expect(cardEl.classList.contains('bg-primary')).toBe(false);
  });
});
