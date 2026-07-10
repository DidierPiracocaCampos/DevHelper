import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from './ui-field';

@Component({
  selector: 'ui-field-errors',
  imports: [NgTemplateOutlet],
  template: `
    @for (m of messages(); track $index) {
      @if ((errors()?.[m.error()] && isInvalid()) || m.visible()) {
        <ng-container
          [ngTemplateOutlet]="m.template"
          [ngTemplateOutletContext]="{ $implicit: errors()?.[m.error()] }"
        />
      }
    }
  `,
  styles: ':host { display: contents; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFieldErrors {
  private _field = inject(UiField, { optional: true });

  protected readonly messages = computed(() => this._field?.errorMessages() ?? []);
  protected readonly errors = computed(() => this._field?.errors() ?? null);
  protected readonly isInvalid = computed(() => this._field?.isInvalid() ?? false);
}
