import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiCardButton } from './card-button';

describe('UiCardButton', () => {
  let component: UiCardButton;
  let fixture: ComponentFixture<UiCardButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiCardButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiCardButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
