import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type UiButtonSeverity = 'neutral' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
export type UiButtonSize = 'sm' | 'md' | 'lg';
export type UiButtonVariant = 'filled' | 'outline' | 'ghost';

@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiButton {
  severity = input<UiButtonSeverity>('primary');
  variant = input<UiButtonVariant>('filled');
  size = input<UiButtonSize>('lg');
  type = input<'submit' | 'button' | 'reset'>('button');
  icon = input<string>();
  label = input<string>();
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  click = output();

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