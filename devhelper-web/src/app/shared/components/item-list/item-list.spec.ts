import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiListItem } from './item-list';

describe('UiListItem', () => {
  let component: UiListItem;
  let fixture: ComponentFixture<UiListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiListItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
