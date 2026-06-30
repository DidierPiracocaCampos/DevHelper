import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { EventI } from '../../domain/event.interface';
import { formatTime } from '../../utils/calendar.utils';

export type CalendarEventSeverity = 'primary' | 'neutral';

@Component({
  selector: 'calendar-event',
  templateUrl: './calendar-event.html',
  styleUrl: './calendar-event.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEvent {
  event = input.required<EventI>();
  severity = input<CalendarEventSeverity>('neutral');
  edit = output<EventI>();

  protected readonly timeLabel = computed(() => {
    const ev = this.event();
    if (ev.isAllDay) return 'Todo el día';
    return formatTime(ev.at.toDate());
  });

  protected onClick() {
    this.edit.emit(this.event());
  }
}
