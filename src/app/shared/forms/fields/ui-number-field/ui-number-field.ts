import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';

@Component({
  selector: 'ui-number-field',
  imports: [NgTemplateOutlet],
  templateUrl: './ui-number-field.html',
  styleUrl: './ui-number-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiNumberField),
      multi: true,
    },
  ],
})
export class UiNumberField extends UiField<number | null> {
  placeholder = input<string>('');
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number | null>(null);

  override writeValue(value: number | null): void {
    super.writeValue(value);
  }

  onInput(event: Event) {
    this.setDirty();
    const raw = (event.target as HTMLInputElement).value;
    if (raw === '') {
      this.emitValue(null);
      return;
    }
    const parsed = Number(raw);
    this.emitValue(Number.isNaN(parsed) ? null : parsed);
  }

  onBlur() {
    this.emitTouched();
  }
}
