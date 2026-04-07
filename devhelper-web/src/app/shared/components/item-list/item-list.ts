import { Component, input } from '@angular/core';

@Component({
  selector: 'sh-item-list',
  imports: [],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  label = input<string>();
  sub = input<string>();
  severity = input<"primary" | "secondary">("primary");
}
