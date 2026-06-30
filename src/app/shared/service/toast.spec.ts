import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { ToastService } from './toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('show', () => {
    it('adds a toast to the signal', () => {
      service.show('hola', 'info');
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('hola');
      expect(service.toasts()[0].severity).toBe('info');
    });

    it('schedules an auto-dismiss timer with the given duration', () => {
      service.show('hola', 'info', undefined, 2000);
      expect(service.toasts().length).toBe(1);
      vi.advanceTimersByTime(1999);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].closing).toBe(false);
      vi.advanceTimersByTime(1);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].closing).toBe(true);
      vi.advanceTimersByTime(150);
      expect(service.toasts().length).toBe(0);
    });

    it('uses the default duration of 5000ms when none is provided', () => {
      service.show('hola', 'info');
      vi.advanceTimersByTime(4999);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].closing).toBe(false);
      vi.advanceTimersByTime(1);
      expect(service.toasts()[0].closing).toBe(true);
      vi.advanceTimersByTime(150);
      expect(service.toasts().length).toBe(0);
    });
  });

  describe('dismiss', () => {
    it('removes the toast with the given id', () => {
      service.show('a', 'info');
      service.show('b', 'info');
      const id = service.toasts()[0].id;
      service.dismiss(id);
      expect(service.toasts().map((t) => t.message)).toEqual(['b']);
    });

    it('cancels the pending auto-dismiss timer', () => {
      service.show('a', 'info', undefined, 1000);
      const id = service.toasts()[0].id;
      service.dismiss(id);
      vi.advanceTimersByTime(5000);
      expect(service.toasts().length).toBe(0);
    });

    it('is a no-op for an unknown id', () => {
      service.show('a', 'info');
      service.dismiss('does-not-exist');
      expect(service.toasts().length).toBe(1);
    });

    it('is idempotent when called twice with the same id', () => {
      service.show('a', 'info');
      const id = service.toasts()[0].id;
      service.dismiss(id);
      expect(() => service.dismiss(id)).not.toThrow();
      expect(service.toasts().length).toBe(0);
    });
  });

  describe('closeWithAnimation', () => {
    it('marks the toast as closing first, then removes it after the animation', () => {
      service.show('a', 'info');
      const id = service.toasts()[0].id;
      service.closeWithAnimation(id);
      expect(service.toasts()[0].closing).toBe(true);
      expect(service.toasts().length).toBe(1);
      vi.advanceTimersByTime(149);
      expect(service.toasts().length).toBe(1);
      vi.advanceTimersByTime(1);
      expect(service.toasts().length).toBe(0);
    });

    it('cancels the auto-dismiss timer so the toast does not disappear mid-animation', () => {
      service.show('a', 'info', undefined, 100);
      const id = service.toasts()[0].id;
      service.closeWithAnimation(id);
      vi.advanceTimersByTime(5000);
      expect(service.toasts().length).toBe(0);
    });

    it('is a no-op for an unknown id', () => {
      service.show('a', 'info');
      service.closeWithAnimation('does-not-exist');
      expect(service.toasts().length).toBe(1);
    });
  });

  describe('MAX_TOASTS eviction', () => {
    it('keeps only the 5 most recent toasts', () => {
      for (let i = 0; i < 7; i++) {
        service.show(`t${i}`, 'info');
      }
      expect(service.toasts().length).toBe(5);
      expect(service.toasts().map((t) => t.message)).toEqual(['t2', 't3', 't4', 't5', 't6']);
    });

    it('cancels the timer of the evicted toast so it does not fire later', () => {
      const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
      for (let i = 0; i < 6; i++) {
        service.show(`t${i}`, 'info', undefined, 60000);
      }
      expect(service.toasts().length).toBe(5);
      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });

    it('keeps the 5 most recent toasts visible past the default auto-dismiss', () => {
      for (let i = 0; i < 6; i++) {
        service.show(`t${i}`, 'info', undefined, 60000);
      }
      expect(service.toasts().length).toBe(5);
      vi.advanceTimersByTime(5000);
      expect(service.toasts().length).toBe(5);
    });
  });

  describe('severity helpers', () => {
    it('error() creates a toast with severity error', () => {
      service.error('boom');
      expect(service.toasts()[0].severity).toBe('error');
    });

    it('success() creates a toast with severity success', () => {
      service.success('ok');
      expect(service.toasts()[0].severity).toBe('success');
    });

    it('warning() creates a toast with severity warning', () => {
      service.warning('careful');
      expect(service.toasts()[0].severity).toBe('warning');
    });

    it('info() creates a toast with severity info', () => {
      service.info('fyi');
      expect(service.toasts()[0].severity).toBe('info');
    });

    it('all helpers accept and store details', () => {
      service.error('e', 'd1');
      service.success('s', 'd2');
      service.warning('w', 'd3');
      service.info('i', 'd4');
      expect(service.toasts().map((t) => t.details)).toEqual(['d1', 'd2', 'd3', 'd4']);
    });
  });

  describe('toggleExpanded', () => {
    it('toggles the expanded flag for the given id', () => {
      service.show('a', 'info');
      const id = service.toasts()[0].id;
      expect(service.toasts()[0].expanded).toBe(false);
      service.toggleExpanded(id);
      expect(service.toasts()[0].expanded).toBe(true);
      service.toggleExpanded(id);
      expect(service.toasts()[0].expanded).toBe(false);
    });

    it('is a no-op for an unknown id', () => {
      service.show('a', 'info');
      service.toggleExpanded('does-not-exist');
      expect(service.toasts()[0].expanded).toBe(false);
    });
  });

  describe('hasToasts computed', () => {
    it('is false when there are no toasts', () => {
      expect(service.hasToasts()).toBe(false);
    });

    it('is true when there is at least one toast', () => {
      service.show('a', 'info');
      expect(service.hasToasts()).toBe(true);
    });

    it('returns to false after all toasts dismiss', () => {
      service.show('a', 'info', undefined, 1000);
      vi.advanceTimersByTime(1000);
      expect(service.toasts()[0].closing).toBe(true);
      expect(service.hasToasts()).toBe(true);
      vi.advanceTimersByTime(150);
      expect(service.hasToasts()).toBe(false);
    });
  });
});
