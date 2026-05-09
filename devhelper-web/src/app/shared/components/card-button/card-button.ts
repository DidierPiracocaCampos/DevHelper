import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type CardButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CardButtonShape = 'square' | 'circle';
export type CardButtonSeverity = 'neutral' | 'primary' | 'secondary' | 'accent';

@Component({
  selector: 'sh-card-button',
  imports: [],
  templateUrl: './card-button.html',
  styleUrl: './card-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardButton {
  icon = input.required<string>();
  size = input<CardButtonSize>('lg');
  shape = input<CardButtonShape>('square');
  severity = input<CardButtonSeverity>('secondary');
  disabled = input<boolean>(false);
  click = output();
}