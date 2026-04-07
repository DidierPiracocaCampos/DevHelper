import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardButton } from './card-button';

describe('ActionButton', () => {
  let component: CardButton;
  let fixture: ComponentFixture<CardButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
