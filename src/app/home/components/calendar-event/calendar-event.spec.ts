import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { Timestamp } from '@angular/fire/firestore';
import { CalendarEvent } from './calendar-event';
import { EventI } from '../../domain/event.interface';

const makeEvent = (overrides: Partial<EventI> = {}): EventI => ({
  title: 'Reunion',
  at: Timestamp.fromMillis(new Date(2024, 0, 1, 9, 0).getTime()),
  isAllDay: false,
  notified: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

describe('CalendarEvent', () => {
  let fixture: ComponentFixture<CalendarEvent>;
  let component: CalendarEvent;

  const setup = async (event: EventI) => {
    await TestBed.configureTestingModule({
      imports: [CalendarEvent],
    }).compileComponents();
    fixture = TestBed.createComponent(CalendarEvent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('event', event);
    fixture.detectChanges();
  };

  it('renders the title', async () => {
    await setup(makeEvent({ title: 'Despliegue' }));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Despliegue');
  });

  it('formats the time as HH:mm when not all day', async () => {
    await setup(makeEvent({ at: Timestamp.fromMillis(new Date(2024, 0, 1, 9, 5).getTime()) }));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('09:05');
  });

  it('shows "Todo el día" when isAllDay is true', async () => {
    await setup(makeEvent({ isAllDay: true }));
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Todo el día');
  });

  it('emits edit with the event on click', async () => {
    const ev = makeEvent({ title: 'X' });
    await setup(ev);
    let emitted: EventI | undefined;
    component.edit.subscribe((e) => (emitted = e));
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(emitted).toEqual(ev);
  });

  it('applies primary severity class by default... wait default is neutral', async () => {
    await setup(makeEvent());
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('card-event-neutral')).toBe(true);
  });

  it('applies primary severity class when severity=primary', async () => {
    await setup(makeEvent());
    fixture.componentRef.setInput('severity', 'primary');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('card-event-primary')).toBe(true);
  });
});
