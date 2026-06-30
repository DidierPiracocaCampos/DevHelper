import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UiDateField } from './ui-date-field';

@Component({
  imports: [UiDateField, ReactiveFormsModule],
  template: `
    <ui-date-field [inputId]="id()" labelText="Fecha" [formControl]="ctrl" />
  `,
})
class Host {
  id = signal('d1');
  ctrl = new FormControl<string>('');
}

describe('UiDateField', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    onChange = vi.fn();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    host.ctrl.valueChanges.subscribe(onChange);
    fixture.detectChanges();
  });

  it('escribe un valor ISO yyyy-MM-dd', () => {
    const input = fixture.nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    input.value = '2026-06-30';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('2026-06-30');
  });

  it('marca touched al perder foco', () => {
    const input = fixture.nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    expect(host.ctrl.touched).toBe(true);
  });
});
