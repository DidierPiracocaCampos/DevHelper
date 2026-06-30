import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { EventRepository } from '../../service/events.repository';
import {
  startOfWeek,
  addDays,
  isSameDay,
  formatMonth,
  formatDayNumber,
  WEEKDAY_LABELS,
} from '../../utils/calendar.utils';
import {
  CalendarEvent,
  CalendarEventSeverity,
} from '../../components/calendar-event/calendar-event';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { EventI } from '../../domain/event.interface';

@Component({
  selector: 'app-calendar',
  imports: [CalendarEvent, UiButton, UiModal],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Calendar {
  private _repo = inject(EventRepository);
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);

  protected readonly selectedDay = signal(new Date());
  protected readonly today = signal(new Date());

  protected readonly eventsResource = this._repo.eventsOfDay$(this.selectedDay);
  protected readonly events = computed<EventI[]>(() => {
    const v = this.eventsResource.value();
    return Array.isArray(v) ? (v as EventI[]) : [];
  });
  protected readonly editing = signal<EventI | null | undefined>(undefined);
  protected readonly isModalOpen = computed(() => this.editing() !== undefined);
  protected readonly saving = signal(false);

  protected readonly weekStart = computed(() => startOfWeek(this.selectedDay()));
  protected readonly weekDays = computed(() =>
    Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)),
  );
  protected readonly monthLabel = computed(() => formatMonth(this.weekStart()));
  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected readonly weekdayLabelFor = (d: Date): string =>
    this.weekdayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1];
  protected readonly dayNumberFor = (d: Date): string => formatDayNumber(d);
  protected readonly isToday = (d: Date): boolean => isSameDay(d, this.today());
  protected readonly isSelected = (d: Date): boolean => isSameDay(d, this.selectedDay());

  protected severityFor(index: number): CalendarEventSeverity {
    return index === 0 ? 'primary' : 'neutral';
  }

  protected goPrevWeek() {
    this.selectedDay.set(addDays(this.selectedDay(), -7));
  }
  protected goNextWeek() {
    this.selectedDay.set(addDays(this.selectedDay(), 7));
  }
  protected goToday() {
    this.selectedDay.set(new Date());
  }
  protected selectDay(d: Date) {
    this.selectedDay.set(d);
  }
  protected openCreate() {
    this.editing.set(null);
  }
  protected openEdit(ev: EventI) {
    this.editing.set(ev);
  }
  protected closeModal() {
    this.editing.set(undefined);
  }

  protected onSave(_input: unknown) {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 0);
  }
  protected async onDelete(_id: string) {
    await this._confirm.delete('¿Eliminar este evento?');
  }

  protected trackById = (_: number, e: EventI) => e.id ?? e.title;
}
