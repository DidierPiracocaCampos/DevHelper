import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardTheme = 'dark' | 'light';

@Component({
  selector: 'sh-card-base',
  imports: [],
  templateUrl: './card-base.html',
  styleUrl: './card-base.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardBase {
  title = input<string>();
  subtitle = input<string>();
  variant = input<CardVariant>('default');
  theme = input<CardTheme>('dark');
  actions = input(true, { transform: booleanAttribute });
  padding = input<'sm' | 'md' | 'lg'>('md');

  readonly _themeClass = computed<string>(() => {
    const theme = this.theme();
    return theme === 'dark' ? 'bg-base-100' : 'bg-primary text-primary-content';
  });

  readonly _variantClass = computed<string>(() => {
    const variant = this.variant();
    if (variant === 'elevated') return 'card-base-elevated';
    if (variant === 'outlined') return 'border border-base-300';
    return '';
  });

  readonly _paddingClass = computed<string>(() => {
    const padding = this.padding();
    if (padding === 'sm') return 'p-3';
    if (padding === 'lg') return 'p-6';
    return 'p-4';
  });
}