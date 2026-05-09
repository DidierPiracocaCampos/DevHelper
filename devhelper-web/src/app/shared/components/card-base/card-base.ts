import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type UiCardVariant = 'default' | 'elevated' | 'outlined';
export type UiCardTheme = 'dark' | 'light';

@Component({
  selector: 'ui-card',
  imports: [],
  templateUrl: './card-base.html',
  styleUrl: './card-base.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiCard {
  title = input<string>();
  subtitle = input<string>();
  variant = input<UiCardVariant>('default');
  theme = input<UiCardTheme>('dark');
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