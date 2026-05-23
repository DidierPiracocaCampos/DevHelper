import { Component, input, output } from '@angular/core';

export type UiListButtonSeverity =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'error'
  | 'success'
  | 'warning';
export type UiListButtonVariant = 'ghost' | 'outline' | 'solid';

@Component({
  selector: 'ui-list-button',
  imports: [],
  templateUrl: './list-button.html',
  styleUrl: './list-button.css',
})
export class UiListButton {
  icon = input.required<string>();
  variant = input<UiListButtonVariant>('ghost');
  severity = input<UiListButtonSeverity>('primary');

  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  click = output();
}
