import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiListButton } from './list-button';

describe('UiListButton', () => {
  let component: UiListButton;
  let fixture: ComponentFixture<UiListButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiListButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiListButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
