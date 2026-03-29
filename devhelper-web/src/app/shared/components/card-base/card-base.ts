import { booleanAttribute, Component, computed, input } from '@angular/core';

@Component({
  selector: 'sh-card-base',
  imports: [],
  templateUrl: './card-base.html',
  styleUrl: './card-base.css',
})
export class CardBase {
  color = input<'DARK' | 'LIGTH'>('DARK');
  title = input<string>();
  actions = input(true, {transform: booleanAttribute});
  readonly _theme = computed<string>(() => this.color() === 'DARK' ? 'black' : 'lofi');


}
