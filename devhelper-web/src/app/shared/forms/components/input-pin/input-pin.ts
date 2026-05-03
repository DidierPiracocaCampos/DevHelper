import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, input, viewChildren } from '@angular/core';
import { InputBase } from '../input-base/input-base';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'sh-input-pin',
  imports: [NgTemplateOutlet],
  templateUrl: './input-pin.html',
  styleUrl: './input-pin.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPin),
      multi: true,
    },
  ]
})
export class InputPin extends InputBase<string> {

  label = input();
  length = input<number>(4);
  digits: string[] = [];

  private inputs = viewChildren<ElementRef<HTMLInputElement>>('pinInput');

  inputOnInit() {
    this.digits = Array(this.length()).fill('');

    queueMicrotask(() => this.focus(0));
  }

  private focus(index: number) {
    const el = this.inputs()[index]?.nativeElement;
    if (el) {
      el.focus();
    }
  }

  onInputNumber(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.digits[index] = value;
    if (value && index < this.length() - 1) {
      this.focus(index + 1);
    }
    if (this.getValue().length === this.length()) {
      this.onTouched();
    }
    this.onChange(this.getValue());
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (
      !allowedKeys.includes(event.key) &&
      !/^\d$/.test(event.key)
    ) {
      event.preventDefault();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) this.focus(index - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < this.length() - 1) this.focus(index + 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.focus(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.focus(this.length() - 1);
      return;
    }

    if (event.key === 'Backspace') {
      if (this.digits[index]) {
        this.digits[index] = '';
        this.onChange(this.getValue());
        return;
      }

      if (index > 0) {
        this.focus(index - 1);
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const paste = event.clipboardData?.getData('text') ?? '';
    const numbers = paste.replace(/\D/g, '').slice(0, this.length());

    this.digits = Array(this.length()).fill('').map((_, i) => numbers[i] ?? '');

    this.onChange(this.getValue());

    this.focus(Math.min(numbers.length, this.length() - 1));
  }

  getValue(): string {
    return this.digits.join('');
  }

  override writeValue(value: string | null): void {
    this.value = value;

    const val = value ?? '';
    const chars = val.split('').slice(0, this.length());

    this.digits = Array(this.length()).fill('').map((_, i) => chars[i] ?? '');
  }

}

