import { Component, input } from '@angular/core';

export type UiListItemVariant = 'default' | 'outlined' | 'plain';
export type UiListItemColor = 'primary' | 'secondary' | 'accent';

@Component({
  selector: 'ui-list-item',
  imports: [],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class UiListItem {
  label = input<string>();
  sub = input<string>();
  variant = input<UiListItemVariant>('default');
  color = input<UiListItemColor>('primary');
  disabled = input<boolean>(false);
  selected = input<boolean>(false);
}