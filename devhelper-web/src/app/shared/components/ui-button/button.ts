import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-button',
  imports: [NgClass],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Button {
  severity = input<'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'>('primary');
  type = input<'submit' | 'button' | 'reset'>();
  btnClass = input<string>('');
  icon = input<string>();
  label = input<string>();
  isLoading = input<boolean>(false);
  disabled = input<boolean>(false);
  onClick = output();

}