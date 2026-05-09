import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type UiCardButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type UiCardButtonShape = 'square' | 'circle';
export type UiCardButtonSeverity = 'neutral' | 'primary' | 'secondary' | 'accent';

@Component({
  selector: 'ui-card-button',
  imports: [],
  templateUrl: './card-button.html',
  styleUrl: './card-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiCardButton {
  icon = input.required<string>();
  size = input<UiCardButtonSize>('lg');
  shape = input<UiCardButtonShape>('square');
  severity = input<UiCardButtonSeverity>('secondary');
  disabled = input<boolean>(false);
  click = output();
}