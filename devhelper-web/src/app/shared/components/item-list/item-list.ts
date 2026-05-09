import { Component, input } from '@angular/core';

export type ItemListVariant = 'default' | 'outlined' | 'plain';
export type ItemListColor = 'primary' | 'secondary' | 'accent';

@Component({
  selector: 'sh-item-list',
  imports: [],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  label = input<string>();
  sub = input<string>();
  variant = input<ItemListVariant>('default');
  color = input<ItemListColor>('primary');
  disabled = input<boolean>(false);
  selected = input<boolean>(false);
}