import { Component, input, output } from '@angular/core';

export type UiListButtonSeverity = 'ghost' | 'neutral' | 'primary';

@Component({
  selector: 'ui-list-button',
  imports: [],
  templateUrl: './list-button.html',
  styleUrl: './list-button.css',
})
export class UiListButton {
  icon = input.required<string>();
  severity = input<UiListButtonSeverity>('ghost');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  click = output();
}