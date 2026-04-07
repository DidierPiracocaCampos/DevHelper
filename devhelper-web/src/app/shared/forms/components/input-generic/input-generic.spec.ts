import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputGeneric } from './input-generic';

describe('InputGeneric', () => {
  let component: InputGeneric;
  let fixture: ComponentFixture<InputGeneric>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputGeneric]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputGeneric);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
