import { Component, forwardRef, input } from '@angular/core';
import { InputBase } from '../input-base/input-base';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-input',
  imports: [NgTemplateOutlet],
  templateUrl: './input-generic.html',
  styleUrl: './input-generic.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInput),
      multi: true,
    },
  ]
})
export class UiInput extends InputBase<any> {
  label = input();
  type = input('string');
  icon = input<string>();

  protected override inputOnInit(): void {
  }
}
