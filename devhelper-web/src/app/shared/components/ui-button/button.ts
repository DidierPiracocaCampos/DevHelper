import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonSeverity = 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'filled' | 'outline' | 'ghost';

@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Button {
  severity = input<ButtonSeverity>('primary');
  variant = input<ButtonVariant>('filled');
  size = input<ButtonSize>('lg');
  type = input<'submit' | 'button' | 'reset'>('button');
  icon = input<string>();
  label = input<string>();
  isLoading = input<boolean>(false);
  disabled = input<boolean>(false);
  onClick = output();

  getSeverityClass(): string {
    const variant = this.variant();
    const severity = this.severity();
    if (variant === 'outline') return `btn-outline btn-${severity}`;
    if (variant === 'ghost') return `btn-ghost`;
    return `btn-${severity}`;
  }

  getSizeClass(): string {
    const size = this.size();
    return `btn-${size}`;
  }
}