import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'sh-card-button',
  imports: [],
  templateUrl: './card-button.html',
  styleUrl: './card-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardButton {
  icon = input<string>();
  styleClass = input<string>();
  iconClass = input<string>();
  type = input<'circle' | 'square'>('square');
  size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md')
  severity = input<'secundary' | 'primary'>('secundary');
  click = output();
}
