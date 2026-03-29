import { Component, input } from '@angular/core';

@Component({
  selector: 'sh-action-button',
  imports: [],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  icon = input<string>();
  type = input<'circle' | 'square'>('square');
  severity = input<'primary' | 'secundary' | 'light'>('primary');
}
