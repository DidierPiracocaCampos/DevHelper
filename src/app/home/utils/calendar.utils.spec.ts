import { describe, it, expect } from 'vitest';
import {
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
  formatMonth,
  formatDayNumber,
  formatTime,
  WEEKDAY_LABELS,
} from './calendar.utils';

describe('calendar.utils', () => {
  it('startOfWeek returns the Monday of the same week at 00:00:00.000', () => {
    // Wednesday 2024-03-13
    const wed = new Date(2024, 2, 13, 15, 30, 45, 123);
    const mon = startOfWeek(wed);
    expect(mon.getFullYear()).toBe(2024);
    expect(mon.getMonth()).toBe(2);
    expect(mon.getDate()).toBe(11);
    expect(mon.getHours()).toBe(0);
    expect(mon.getMinutes()).toBe(0);
    expect(mon.getSeconds()).toBe(0);
    expect(mon.getMilliseconds()).toBe(0);
  });

  it('startOfWeek on a Sunday returns the previous Monday', () => {
    // Sunday 2024-03-17
    const sun = new Date(2024, 2, 17, 9, 0);
    const mon = startOfWeek(sun);
    expect(mon.getDate()).toBe(11);
    expect(mon.getMonth()).toBe(2);
  });

  it('startOfWeek on a Monday returns the same day at 00:00', () => {
    const mon = new Date(2024, 2, 11, 5, 0);
    const result = startOfWeek(mon);
    expect(isSameDay(result, mon)).toBe(true);
    expect(result.getHours()).toBe(0);
  });

  it('addDays returns a new Date shifted by n days, not mutating input', () => {
    const d = new Date(2024, 0, 31);
    const next = addDays(d, 1);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(1);
    expect(d.getDate()).toBe(31);
  });

  it('addDays(-7) goes back exactly one week', () => {
    const d = new Date(2024, 2, 20);
    const prev = addDays(d, -7);
    expect(prev.getDate()).toBe(13);
  });

  it('isSameDay is true when year/month/date match, ignoring time', () => {
    const a = new Date(2024, 2, 15, 9, 0);
    const b = new Date(2024, 2, 15, 23, 59);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('isSameDay is false when any of year/month/date differs', () => {
    expect(isSameDay(new Date(2024, 2, 15), new Date(2024, 2, 16))).toBe(false);
    expect(isSameDay(new Date(2024, 2, 15), new Date(2024, 3, 15))).toBe(false);
    expect(isSameDay(new Date(2024, 2, 15), new Date(2025, 2, 15))).toBe(false);
  });

  it('startOfDay zeros hours/minutes/seconds/ms', () => {
    const d = new Date(2024, 2, 15, 14, 30, 45, 999);
    const sod = startOfDay(d);
    expect(sod.getHours()).toBe(0);
    expect(sod.getMinutes()).toBe(0);
    expect(sod.getSeconds()).toBe(0);
    expect(sod.getMilliseconds()).toBe(0);
    expect(isSameDay(sod, d)).toBe(true);
  });

  it('endOfDay sets 23:59:59.999', () => {
    const d = new Date(2024, 2, 15, 0, 0, 0, 0);
    const eod = endOfDay(d);
    expect(eod.getHours()).toBe(23);
    expect(eod.getMinutes()).toBe(59);
    expect(eod.getSeconds()).toBe(59);
    expect(eod.getMilliseconds()).toBe(999);
  });

  it('formatMonth returns the lowercase es-ES month name', () => {
    const jan = new Date(2024, 0, 15);
    const sep = new Date(2024, 8, 15);
    expect(formatMonth(jan)).toBe('enero');
    expect(formatMonth(sep)).toBe('septiembre');
  });

  it('formatDayNumber returns the day of month without leading zero', () => {
    expect(formatDayNumber(new Date(2024, 0, 1))).toBe('1');
    expect(formatDayNumber(new Date(2024, 0, 31))).toBe('31');
  });

  it('formatTime returns HH:mm 24h', () => {
    expect(formatTime(new Date(2024, 0, 1, 9, 0))).toBe('09:00');
    expect(formatTime(new Date(2024, 0, 1, 23, 5))).toBe('23:05');
    expect(formatTime(new Date(2024, 0, 1, 0, 0))).toBe('00:00');
  });

  it('WEEKDAY_LABELS is exactly 7 Spanish initials starting with L (lunes)', () => {
    expect(WEEKDAY_LABELS).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    expect(WEEKDAY_LABELS).toHaveLength(7);
  });
});
