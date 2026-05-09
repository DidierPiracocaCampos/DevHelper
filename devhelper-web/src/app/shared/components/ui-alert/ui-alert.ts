import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiAlertSeverity = 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'ui-alert',
  imports: [],
  templateUrl: './ui-alert.html',
  styleUrl: './ui-alert.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiAlert {
  severity = input<UiAlertSeverity>('error');
  title = input<string>();
  message = input<string>();
  icon = input<string>();
}