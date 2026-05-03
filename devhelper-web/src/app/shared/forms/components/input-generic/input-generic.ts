import { Component, forwardRef, input } from '@angular/core';
import { InputBase } from '../input-base/input-base';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'sh-input',
  imports: [NgTemplateOutlet],
  templateUrl: './input-generic.html',
  styleUrl: './input-generic.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputGeneric),
      multi: true,
    },
  ]
})
export class InputGeneric extends InputBase<any> {

  label = input();
  type = input('string');

  protected override inputOnInit(): void {
  }
}
