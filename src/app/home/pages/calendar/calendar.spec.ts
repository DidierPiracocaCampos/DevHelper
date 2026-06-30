import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { resource, signal, Signal, WritableSignal } from '@angular/core';
import Calendar from './calendar';
import { EventRepository } from '../../service/events.repository';
import { Authenticator } from '../../../shared/service/authenticator';
import { Firestore } from '@angular/fire/firestore';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { EventI, EventCreateInput, EventUpdateInput } from '../../domain/event.interface';

class FakeAuth {
  user = signal({ uid: 'u1' });
}

class FakeEventRepository {
  addEvent = vi.fn(
    (_input: EventCreateInput): Promise<EventI & { id: string }> =>
      Promise.resolve({} as EventI & { id: string }),
  );
  updateEvent = vi.fn((_id: string, _patch: EventUpdateInput): Promise<void> => Promise.resolve());
  deleteEvent = vi.fn((_id: string): Promise<void> => Promise.resolve());
  getCollection = vi.fn(() =>
    resource({
      params: () => null as null,
      loader: () => Promise.resolve([] as (EventI & { id: string })[]),
    }),
  );
  eventsOfDay$(_day: Signal<Date>) {
    return resource({
      params: () => ({}) as Record<string, never>,
      loader: () => Promise.resolve([] as EventI[]),
    });
  }
}

class FakeConfirm {
  delete = vi.fn((_msg: string): Promise<boolean> => Promise.resolve(true));
}

class FakeToast {}

type TestableCalendar = Calendar & {
  selectedDay: WritableSignal<Date>;
  weekStart: Signal<Date>;
  weekDays: Signal<Date[]>;
  monthLabel: Signal<string>;
  isToday: (d: Date) => boolean;
  goPrevWeek: () => void;
  goNextWeek: () => void;
  goToday: () => void;
  selectDay: (d: Date) => void;
};

function asTestable(c: Calendar): TestableCalendar {
  return c as unknown as TestableCalendar;
}

describe('Calendar', () => {
  let fixture: ComponentFixture<Calendar>;
  let component: Calendar;
  let t: TestableCalendar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
      providers: [
        { provide: Authenticator, useClass: FakeAuth },
        { provide: EventRepository, useClass: FakeEventRepository },
        { provide: Firestore, useValue: {} },
        { provide: ConfirmService, useClass: FakeConfirm },
        { provide: ToastService, useClass: FakeToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
    t = asTestable(component);
    fixture.detectChanges();
  });

  it('selectedDay starts as today (same calendar day)', () => {
    const today = new Date();
    const sel = t.selectedDay();
    expect(
      sel.getFullYear() === today.getFullYear() &&
        sel.getMonth() === today.getMonth() &&
        sel.getDate() === today.getDate(),
    ).toBe(true);
  });

  it('weekStart is always a Monday (day 1)', () => {
    const wed = new Date(2024, 2, 13);
    t.selectedDay.set(wed);
    const mon = t.weekStart();
    expect(mon.getDay()).toBe(1);
  });

  it('weekStart on a Sunday is the previous Monday', () => {
    const sun = new Date(2024, 2, 17);
    t.selectedDay.set(sun);
    expect(t.weekStart().getDate()).toBe(11);
  });

  it('weekDays returns 7 dates Monday to Sunday', () => {
    const wed = new Date(2024, 2, 13);
    t.selectedDay.set(wed);
    const days = t.weekDays();
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
    expect(days[6].getDay()).toBe(0);
    for (let i = 1; i < 7; i++) {
      const diff = (days[i].getTime() - days[i - 1].getTime()) / (24 * 3600 * 1000);
      expect(diff).toBe(1);
    }
  });

  it('goPrevWeek shifts selectedDay back exactly 7 days', () => {
    const d = new Date(2024, 2, 20);
    t.selectedDay.set(d);
    t.goPrevWeek();
    expect(t.selectedDay().getDate()).toBe(13);
  });

  it('goNextWeek shifts selectedDay forward exactly 7 days', () => {
    const d = new Date(2024, 2, 20);
    t.selectedDay.set(d);
    t.goNextWeek();
    expect(t.selectedDay().getDate()).toBe(27);
  });

  it('goToday sets selectedDay to today', () => {
    const past = new Date(2000, 0, 1);
    t.selectedDay.set(past);
    t.goToday();
    const now = new Date();
    expect(t.selectedDay().getDate()).toBe(now.getDate());
  });

  it('selectDay replaces the selectedDay signal', () => {
    const target = new Date(2024, 5, 15);
    t.selectDay(target);
    expect(t.selectedDay().getFullYear()).toBe(2024);
    expect(t.selectedDay().getMonth()).toBe(5);
    expect(t.selectedDay().getDate()).toBe(15);
  });

  it('monthLabel is the lowercase es-ES name of the weekStart', () => {
    const wed = new Date(2024, 0, 10);
    t.selectedDay.set(wed);
    expect(t.monthLabel()).toBe('enero');
  });

  it('isToday matches only the calendar day equal to today', () => {
    t.selectDay(new Date());
    expect(t.isToday(t.selectedDay())).toBe(true);
    expect(t.isToday(new Date(2000, 0, 1))).toBe(false);
  });
});
