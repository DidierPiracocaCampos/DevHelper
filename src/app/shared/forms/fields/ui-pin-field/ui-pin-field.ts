import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { UiField } from '../ui-field/ui-field';

@Component({
  selector: 'ui-pin-field',
  imports: [NgTemplateOutlet],
  templateUrl: './ui-pin-field.html',
  styleUrl: './ui-pin-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiPinField),
      multi: true,
    },
  ],
})
export class UiPinField extends UiField<string> implements AfterViewInit {
  labelText = input<string>('PIN');
  length = input<number>(4);

  readonly digits = signal<string[]>([]);
  private inputs = viewChildren<ElementRef<HTMLInputElement>>('pinInput');

  private _lengthEffect = effect(() => {
    const len = this.length();
    this.digits.set(Array(len).fill(''));
  });

  ngAfterViewInit(): void {
    queueMicrotask(() => this.focus(0));
  }

  private syncDOM() {
    const inputs = this.inputs();
    const value = this.digits();
    inputs.forEach((el, i) => {
      el.nativeElement.value = value[i] ?? '';
    });
  }

  private focus(index: number) {
    const el = this.inputs()[index]?.nativeElement;
    el?.focus();
    el?.select();
  }

  private getValue(): string {
    return this.digits().join('');
  }

  private emitPin() {
    this.emitValue(this.getValue());
  }

  onInputNumber(event: Event, index: number) {
    this.setDirty();
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    this.digits.update((d) => {
      const next = [...d];
      next[index] = value;
      return next;
    });

    if (value && index < this.length() - 1) {
      this.focus(index + 1);
    }

    this.emitPin();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
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
      const current = this.digits()[index];
      if (current) {
        this.digits.update((d) => {
          const next = [...d];
          next[index] = '';
          return next;
        });
        this.emitPin();
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

    this.digits.update(() => {
      const next = Array(this.length()).fill('');
      for (let i = 0; i < numbers.length; i++) {
        next[i] = numbers[i];
      }
      return next;
    });

    queueMicrotask(() => {
      this.syncDOM();
      this.focus(Math.min(numbers.length, this.length() - 1));
    });

    this.emitPin();
  }

  onBlurHandler() {
    this.emitTouched();
  }

  override writeValue(value: string | null): void {
    const v = value ?? '';
    this.digits.update(() => {
      const next = Array(this.length()).fill('');
      for (let i = 0; i < this.length() && i < v.length; i++) {
        next[i] = v[i];
      }
      return next;
    });
    queueMicrotask(() => this.syncDOM());
  }
}
