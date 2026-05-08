import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'ui-alert',
  imports: [],
  templateUrl: './ui-alert.html',
  styleUrl: './ui-alert.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiAlert {
  severity = input<AlertSeverity>('error');
  title = input<string>();
  message = input<string>();
  icon = input<string>();
}