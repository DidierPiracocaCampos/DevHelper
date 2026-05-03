import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'sh-button',
  imports: [NgClass],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Button {
  severity = input<'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'>();
  type = input<'submit' | 'button' | 'reset'>();
  btnClass = input<string>();
  label = input<string>();
  isLoandig = input<boolean>(false);
  disabled = input<boolean>(false);
  onClick = output();



}
