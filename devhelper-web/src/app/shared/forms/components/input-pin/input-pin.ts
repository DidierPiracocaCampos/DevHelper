import { AfterViewInit, Component, ElementRef, forwardRef, input, viewChildren } from '@angular/core';
import { InputBase } from '../input-base/input-base';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'sh-input-pin',
  imports: [NgTemplateOutlet],
  templateUrl: './input-pin.html',
  styleUrl: './input-pin.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPin),
      multi: true,
    },
  ]
})
export class InputPin extends InputBase<string> implements AfterViewInit {

  label = input<string>();
  length = input<number>(4);

  private inputs = viewChildren<ElementRef<HTMLInputElement>>('pinInput');

  protected digits: string[] = [];

  protected override inputOnInit(): void {
  }

  ngAfterViewInit() {
    this.resetDigits();
    queueMicrotask(() => this.focus(0));
  }

  private resetDigits(value: string = '') {
    this.digits = Array(this.length())
      .fill('')
      .map((_, i) => value[i] ?? '');
  }

  private syncDOM() {
    const inputs = this.inputs();

    inputs.forEach((el, i) => {
      el.nativeElement.value = this.digits[i] ?? '';
    });
  }

  private focus(index: number) {
    const el = this.inputs()[index]?.nativeElement;
    el?.focus();
  }

  onInputNumber(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    this.digits[index] = value;

    if (value && index < this.length() - 1) {
      this.focus(index + 1);
    }

    this.emitValue();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];

    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
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
        this.emitValue();
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

    this.resetDigits(numbers);
    this.syncDOM();

    this.emitValue();

    this.focus(Math.min(numbers.length, this.length() - 1));
  }


  getValue(): string {
    return this.digits.join('');
  }

  private emitValue() {
    this.onChange(this.getValue());
  }

  override writeValue(value: string | null): void {
    const val = value ?? '';

    this.digits = Array(this.length())
      .fill('')
      .map((_, i) => val[i] ?? '');

    queueMicrotask(() => {
      this.inputs().forEach((el, i) => {
        el.nativeElement.value = this.digits[i] ?? '';
      });
    });
  }
  
}