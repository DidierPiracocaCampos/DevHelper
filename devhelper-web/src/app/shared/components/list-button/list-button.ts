import { Component, input, output } from '@angular/core';

export type ListButtonSeverity = 'ghost' | 'neutral' | 'primary';

@Component({
  selector: 'sh-list-button',
  imports: [],
  templateUrl: './list-button.html',
  styleUrl: './list-button.css',
})
export class ListButton {
  icon = input.required<string>();
  severity = input<ListButtonSeverity>('ghost');
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  onClick = output();
}