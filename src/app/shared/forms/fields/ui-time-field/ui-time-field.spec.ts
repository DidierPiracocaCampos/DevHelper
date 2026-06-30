import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UiTimeField } from './ui-time-field';

@Component({
  imports: [UiTimeField, ReactiveFormsModule],
  template: `
    <ui-time-field [inputId]="id()" labelText="Hora" [formControl]="ctrl" />
  `,
})
class Host {
  id = signal('t1');
  ctrl = new FormControl<string>('');
}

describe('UiTimeField', () => {
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

  it('escribe un valor HH:mm', () => {
    const input = fixture.nativeElement.querySelector('input[type=time]') as HTMLInputElement;
    input.value = '09:30';
    input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenCalledWith('09:30');
  });

  it('marca touched al perder foco', () => {
    const input = fixture.nativeElement.querySelector('input[type=time]') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    expect(host.ctrl.touched).toBe(true);
  });
});
