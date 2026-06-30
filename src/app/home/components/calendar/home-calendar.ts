import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { EventRepository } from '../../service/events.repository';
import {
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  formatMonth,
  formatDayNumber,
  WEEKDAY_LABELS,
} from '../../utils/calendar.utils';
import { CalendarEvent, CalendarEventSeverity } from '../calendar-event/calendar-event';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { UiTooltipComponent } from '../../../shared/components/tooltip';
import {
  UiTextField,
  UiTextareaField,
  UiNumberField,
  UiDateField,
  UiTimeField,
} from '../../../shared/forms/fields';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { EventI, EventCreateInput, EventUpdateInput } from '../../domain/event.interface';

const TIME_FORMAT = /^(\d{2}):(\d{2})$/;

@Component({
  selector: 'home-calendar',
  imports: [
    ReactiveFormsModule,
    CalendarEvent,
    UiButton,
    UiModal,
    UiTextField,
    UiTextareaField,
    UiNumberField,
    UiDateField,
    UiTimeField,
    UiCard,
    UiCardButton,
    UiTooltipComponent,
  ],
  templateUrl: './home-calendar.html',
  styleUrl: './home-calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeCalendar {
  private _repo = inject(EventRepository);
  private _fb = inject(FormBuilder).nonNullable;
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);

  protected readonly selectedDay = signal(new Date());
  protected readonly today = signal(new Date());
  protected readonly eventsResource = this._repo.eventsOfDay$(this.selectedDay);
  protected readonly events = computed<EventI[]>(() => this.eventsResource.value() ?? []);
  protected readonly editing = signal<EventI | null | undefined>(undefined);
  protected readonly isModalOpen = computed(() => this.editing() !== undefined);
  protected readonly saving = signal(false);

  protected readonly form = this._fb.group({
    title: this._fb.control<string>('', [Validators.required, Validators.maxLength(200)]),
    description: this._fb.control<string>('', [Validators.maxLength(2000)]),
    atDate: this._fb.control<string>('', [Validators.required]),
    atTime: this._fb.control<string>('09:00', [Validators.required]),
    isAllDay: this._fb.control<boolean>(false),
    durationMinutes: this._fb.control<number | null>(null, [
      Validators.min(0),
      Validators.max(1440),
    ]),
  });

  protected readonly weekStart = computed(() => startOfWeek(this.selectedDay()));
  protected readonly weekDays = computed(() =>
    Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)),
  );
  protected readonly monthLabel = computed(() => formatMonth(this.weekStart()));
  protected readonly weekdayLabels = WEEKDAY_LABELS;

  private _reloadAfterEdit = effect(() => {
    void this.eventsResource.value();
  });

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
    this._fillFormForCreate();
    this.editing.set(null);
  }
  protected openEdit(ev: EventI) {
    this._fillFormForEdit(ev);
    this.editing.set(ev);
  }
  protected closeModal() {
    this.editing.set(undefined);
    this.form.reset({
      title: '',
      description: '',
      atDate: '',
      atTime: '09:00',
      isAllDay: false,
      durationMinutes: null,
    });
  }

  protected async onSave() {
    if (this.form.invalid) {
      this.form.markAllAsDirty();
      return;
    }
    const v = this.form.getRawValue();
    const at = this._composeAt(v.atDate, v.atTime, v.isAllDay);
    const editing = this.editing();
    this.saving.set(true);
    try {
      if (editing && editing.id) {
        const patch: EventUpdateInput = {
          title: v.title.trim(),
          description: v.description.trim() || undefined,
          at,
          isAllDay: v.isAllDay,
          durationMinutes: v.durationMinutes ?? undefined,
        };
        await firstValueFrom(this._repo.updateEvent(editing.id, patch));
        this._toast.success('Evento actualizado');
      } else {
        const input: EventCreateInput = {
          title: v.title.trim(),
          description: v.description.trim() || undefined,
          at,
          isAllDay: v.isAllDay,
          durationMinutes: v.durationMinutes ?? undefined,
        };
        await firstValueFrom(this._repo.addEvent(input));
        this._toast.success('Evento creado');
      }
      this.eventsResource.reload();
      this.closeModal();
    } catch (err) {
      console.error('Error saving event', err);
      this._toast.error('No se pudo guardar el evento');
    } finally {
      this.saving.set(false);
    }
  }

  protected async onDelete() {
    const editing = this.editing();
    if (!editing || !editing.id) return;
    const ok = await this._confirm.delete('¿Eliminar este evento?');
    if (!ok) return;
    try {
      await firstValueFrom(this._repo.deleteEvent(editing.id));
      this._toast.success('Evento eliminado');
      this.eventsResource.reload();
      this.closeModal();
    } catch (err) {
      console.error('Error deleting event', err);
      this._toast.error('No se pudo eliminar el evento');
    }
  }

  protected trackById = (_: number, e: EventI) => e.id ?? e.title;

  private _fillFormForCreate() {
    const day = this.selectedDay();
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    this.form.reset({
      title: '',
      description: '',
      atDate: `${yyyy}-${mm}-${dd}`,
      atTime: '09:00',
      isAllDay: false,
      durationMinutes: null,
    });
  }

  private _fillFormForEdit(ev: EventI) {
    const d = ev.at.toDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    this.form.reset({
      title: ev.title,
      description: ev.description ?? '',
      atDate: `${yyyy}-${mm}-${dd}`,
      atTime: `${hh}:${mi}`,
      isAllDay: ev.isAllDay,
      durationMinutes: ev.durationMinutes ?? null,
    });
  }

  private _composeAt(dateStr: string, timeStr: string, isAllDay: boolean): Timestamp {
    const m = TIME_FORMAT.exec(timeStr);
    const hh = m ? Number(m[1]) : 0;
    const mi = m ? Number(m[2]) : 0;
    const parts = dateStr.split('-').map((s) => Number(s));
    const year = parts[0] ?? 1970;
    const monthIdx = (parts[1] ?? 1) - 1;
    const day = parts[2] ?? 1;
    const date = isAllDay
      ? startOfDay(new Date(year, monthIdx, day))
      : new Date(year, monthIdx, day, hh, mi, 0, 0);
    return Timestamp.fromDate(date);
  }
}
