import { Component, input, output } from '@angular/core';

@Component({
  selector: 'sh-list-button',
  imports: [],
  templateUrl: './list-button.html',
  styleUrl: './list-button.css',
})
export class ListButton {
  icon = input<string>();
  onClick = output();
}
