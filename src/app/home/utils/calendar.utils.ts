export const WEEKDAY_LABELS: readonly string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

export function startOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const offset = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(23, 59, 59, 999);
  return result;
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'long' });
const DAY_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric' });
const TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatMonth(d: Date): string {
  return MONTH_FORMATTER.format(d);
}

export function formatDayNumber(d: Date): string {
  return DAY_FORMATTER.format(d);
}

export function formatTime(d: Date): string {
  return TIME_FORMATTER.format(d);
}
