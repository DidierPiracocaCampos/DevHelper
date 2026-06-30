import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { FormGroup } from '@angular/forms';
import { resource, signal, Signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import HomeCalendar from './home-calendar';
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

class FakeToast {
  success = vi.fn();
  error = vi.fn();
}

type TestableHomeCalendar = HomeCalendar & {
  selectedDay: WritableSignal<Date>;
  weekStart: Signal<Date>;
  weekDays: Signal<Date[]>;
  monthLabel: Signal<string>;
  isToday: (d: Date) => boolean;
  goPrevWeek: () => void;
  goNextWeek: () => void;
  goToday: () => void;
  selectDay: (d: Date) => void;
  form: FormGroup;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  openCreate: () => void;
  openEdit: (ev: EventI) => void;
  isModalOpen: () => boolean;
};

function asTestable(c: HomeCalendar): TestableHomeCalendar {
  return c as unknown as TestableHomeCalendar;
}

describe('HomeCalendar', () => {
  let fixture: ComponentFixture<HomeCalendar>;
  let component: HomeCalendar;
  let t: TestableHomeCalendar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCalendar],
      providers: [
        { provide: Authenticator, useClass: FakeAuth },
        { provide: EventRepository, useClass: FakeEventRepository },
        { provide: Firestore, useValue: {} },
        { provide: ConfirmService, useClass: FakeConfirm },
        { provide: ToastService, useClass: FakeToast },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeCalendar);
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

  describe('form behaviour', () => {
    it('exposes a form group with title, description, atDate, atTime, isAllDay, durationMinutes', () => {
      const f = t.form;
      expect(f.get('title')).toBeTruthy();
      expect(f.get('description')).toBeTruthy();
      expect(f.get('atDate')).toBeTruthy();
      expect(f.get('atTime')).toBeTruthy();
      expect(f.get('isAllDay')).toBeTruthy();
      expect(f.get('durationMinutes')).toBeTruthy();
    });

    it('title is required and capped at 200', () => {
      const ctrl = t.form.get('title')!;
      ctrl.setValue('');
      expect(ctrl.valid).toBe(false);
      ctrl.setValue('a'.repeat(201));
      expect(ctrl.valid).toBe(false);
      ctrl.setValue('Reunion');
      expect(ctrl.valid).toBe(true);
    });

    it('description is capped at 2000', () => {
      const ctrl = t.form.get('description')!;
      ctrl.setValue('x'.repeat(2001));
      expect(ctrl.valid).toBe(false);
      ctrl.setValue('hola');
      expect(ctrl.valid).toBe(true);
    });

    it('durationMinutes is optional but bounded 0..1440', () => {
      const ctrl = t.form.get('durationMinutes')!;
      ctrl.setValue(null);
      expect(ctrl.valid).toBe(true);
      ctrl.setValue(-1);
      expect(ctrl.valid).toBe(false);
      ctrl.setValue(1441);
      expect(ctrl.valid).toBe(false);
      ctrl.setValue(60);
      expect(ctrl.valid).toBe(true);
    });
  });

  describe('create / edit / delete', () => {
    let addSpy: ReturnType<typeof vi.fn>;
    let updateSpy: ReturnType<typeof vi.fn>;
    let deleteSpy: ReturnType<typeof vi.fn>;
    let confirmDelete: ReturnType<typeof vi.fn>;
    let fakeRepo: FakeEventRepository;
    let fakeConfirm: FakeConfirm;

    beforeEach(() => {
      fakeRepo = TestBed.inject(EventRepository) as unknown as FakeEventRepository;
      fakeConfirm = TestBed.inject(ConfirmService) as unknown as FakeConfirm;

      addSpy = vi.fn().mockReturnValue(of({ id: 'e1' }));
      updateSpy = vi.fn().mockReturnValue(of(undefined));
      deleteSpy = vi.fn().mockReturnValue(of(undefined));
      fakeRepo.addEvent = addSpy;
      fakeRepo.updateEvent = updateSpy;
      fakeRepo.deleteEvent = deleteSpy;

      confirmDelete = vi.fn().mockResolvedValue(true);
      fakeConfirm.delete = confirmDelete;
    });

    it('onSave create path calls addEvent and closes the modal', async () => {
      t.openCreate();
      t.form.setValue({
        title: 'Demo',
        description: '',
        atDate: '2024-06-15',
        atTime: '09:30',
        isAllDay: false,
        durationMinutes: null,
      });
      await t.onSave();
      expect(addSpy).toHaveBeenCalledOnce();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(t.isModalOpen()).toBe(false);
    });

    it('onSave update path calls updateEvent with the existing id', async () => {
      t.openEdit({
        id: 'e99',
        title: 'X',
        at: Timestamp.fromMillis(new Date(2024, 6, 15, 9, 30).getTime()),
        isAllDay: false,
        notified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      t.form.setValue({
        title: 'Editado',
        description: '',
        atDate: '2024-06-15',
        atTime: '10:00',
        isAllDay: false,
        durationMinutes: null,
      });
      await t.onSave();
      expect(updateSpy).toHaveBeenCalledOnce();
      expect(updateSpy.mock.calls[0][0]).toBe('e99');
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('onSave blocks when the form is invalid', async () => {
      t.openCreate();
      t.form.patchValue({ title: '' });
      await t.onSave();
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('onDelete confirms and calls deleteEvent on confirm', async () => {
      t.openEdit({
        id: 'e1',
        title: 'X',
        at: Timestamp.now(),
        isAllDay: false,
        notified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await t.onDelete();
      expect(confirmDelete).toHaveBeenCalledOnce();
      expect(deleteSpy).toHaveBeenCalledWith('e1');
      expect(t.isModalOpen()).toBe(false);
    });

    it('onDelete does NOT call deleteEvent when the user cancels', async () => {
      confirmDelete.mockResolvedValueOnce(false);
      t.openEdit({
        id: 'e1',
        title: 'X',
        at: Timestamp.now(),
        isAllDay: false,
        notified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await t.onDelete();
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
});
