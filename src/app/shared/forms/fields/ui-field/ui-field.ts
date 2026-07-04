import {
  AfterContentInit,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  Directive,
  inject,
  Injector,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, ValidationErrors } from '@angular/forms';
import { ErrorMessage } from './error-message';

@Directive({
  selector: 'ng-template[uiLabel]',
})
export class UiLabel {
  template = inject(TemplateRef<unknown>);
}

@Directive()
export abstract class UiField<T = string> implements ControlValueAccessor, AfterContentInit {
  private _ngControl: NgControl | null = null;
  private _injector = inject(Injector);
  private _destroyRef = inject(DestroyRef);

  readonly label = contentChild(UiLabel);
  readonly prefix = contentChild('[prefix]', { read: TemplateRef });
  readonly suffix = contentChild('[suffix]', { read: TemplateRef });
  readonly errorMessages = contentChildren(ErrorMessage);

  inputId = input.required<string>();

  readonly value = signal<T | null>(null);
  readonly disabled = signal<boolean>(false);
  readonly errors = signal<ValidationErrors | null>(null);
  readonly touched = signal<boolean>(false);
  readonly dirty = signal<boolean>(false);

  readonly isInvalid = computed(() => !!this.errors() && (this.touched() || this.dirty()));

  private _onChange: (value: T | null) => void = () => {};
  private _onTouched: () => void = () => {};

  ngOnInit() {
    this._ngControl = this._injector.get(NgControl, null);
  }

  ngAfterContentInit() {
    this._bindToControl();
  }

  private _bindToControl() {
    if (!this._ngControl?.control) return;
    this._syncFromControl();
    this._ngControl.control.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._syncFromControl());
  }

  private _syncFromControl() {
    const control = this._ngControl?.control;
    if (!control) return;
    this.errors.set(control.errors);
    if (control.touched) this.touched.set(true);
    if (control.dirty) this.dirty.set(true);
  }

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected emitValue(value: T): void {
    this.value.set(value);
    this._onChange(value);
  }

  protected emitTouched(): void {
    if (!this.touched()) {
      this.touched.set(true);
    }
    this._onTouched();
  }

  protected setDirty(): void {
    if (!this.dirty()) {
      this.dirty.set(true);
    }
  }

  protected handleInput(event: Event): void {
    this.setDirty();
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (target) {
      this.emitValue(target.value as T);
    }
  }

  protected handleBlur(): void {
    this.emitTouched();
  }

  get control() {
    return this._ngControl?.control;
  }
}
