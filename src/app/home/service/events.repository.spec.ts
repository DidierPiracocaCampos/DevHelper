import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal, Signal } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom, of, Observable } from 'rxjs';
import { EventRepository } from './events.repository';
import { EventI, EventCreateInput, EventUpdateInput } from '../domain/event.interface';

class FakeEventRepository {
  readonly addDocSpy = vi.fn();
  readonly updateDocSpy = vi.fn();
  readonly deleteDocSpy = vi.fn();

  getCollection() {
    return {
      value: (): (EventI & { id: string })[] | undefined => undefined,
      isLoading: (): boolean => false,
      hasValue: (): boolean => false,
      error: (): unknown => undefined,
      reload: vi.fn(),
    };
  }

  addEvent(input: EventCreateInput): Observable<EventI & { id: string }> {
    const now = Timestamp.now();
    const payload: EventI = {
      ...input,
      notified: false,
      createdAt: now,
      updatedAt: now,
    };
    this.addDocSpy(payload);
    return of({ id: 'new-id', ...payload });
  }

  updateEvent(id: string, patch: EventUpdateInput): Observable<void> {
    this.updateDocSpy(id, { ...patch, updatedAt: Timestamp.now() });
    return of(undefined);
  }

  deleteEvent(id: string): Observable<void> {
    this.deleteDocSpy(id);
    return of(undefined);
  }

  eventsOfDay$(_day: Signal<Date>) {
    return {
      value: (): EventI[] | undefined => undefined,
      isLoading: (): boolean => false,
      hasValue: (): boolean => false,
      error: (): unknown => undefined,
      reload: vi.fn(),
    };
  }
}

describe('EventRepository (contract)', () => {
  let repo: FakeEventRepository;

  beforeEach(() => {
    const fake = new FakeEventRepository();
    TestBed.configureTestingModule({
      providers: [{ provide: EventRepository, useValue: fake }],
    });
    repo = TestBed.inject(EventRepository) as unknown as FakeEventRepository;
  });

  describe('addEvent', () => {
    it('stamps createdAt, updatedAt and notified=false', async () => {
      const input: EventCreateInput = {
        title: 'Demo',
        at: Timestamp.fromMillis(Date.now() + 1000),
        isAllDay: false,
      };
      const before = Date.now();
      const result = await firstValueFrom(repo.addEvent(input));
      const after = Date.now();

      expect(repo.addDocSpy).toHaveBeenCalledOnce();
      const written = repo.addDocSpy.mock.calls[0][0] as EventI;
      expect(written.title).toBe('Demo');
      expect(written.notified).toBe(false);
      const createdMs = written.createdAt.toMillis();
      expect(createdMs).toBeGreaterThanOrEqual(before);
      expect(createdMs).toBeLessThanOrEqual(after);
      expect(written.updatedAt.toMillis()).toBe(written.createdAt.toMillis());
      expect(result.id).toBe('new-id');
    });
  });

  describe('updateEvent', () => {
    it('forces updatedAt to a fresh timestamp and forwards the patch', async () => {
      const before = Date.now();
      await firstValueFrom(repo.updateEvent('e1', { title: 'Nuevo' }));
      const after = Date.now();

      expect(repo.updateDocSpy).toHaveBeenCalledOnce();
      const call = repo.updateDocSpy.mock.calls[0];
      expect(call[0]).toBe('e1');
      const patch = call[1] as Partial<EventI>;
      expect(patch.title).toBe('Nuevo');
      const updatedMs = (patch.updatedAt as Timestamp).toMillis();
      expect(updatedMs).toBeGreaterThanOrEqual(before);
      expect(updatedMs).toBeLessThanOrEqual(after);
      expect((patch as { createdAt?: unknown }).createdAt).toBeUndefined();
    });
  });

  describe('deleteEvent', () => {
    it('delegates to deleteDoc mixin with the given id', async () => {
      await firstValueFrom(repo.deleteEvent('e1'));
      expect(repo.deleteDocSpy).toHaveBeenCalledWith('e1');
    });
  });

  describe('eventsOfDay$', () => {
    it('exposes value, isLoading, hasValue, error, reload', () => {
      const day = signal(new Date(2024, 0, 15));
      const res = repo.eventsOfDay$(day);
      expect(typeof res.value).toBe('function');
      expect(typeof res.isLoading).toBe('function');
      expect(typeof res.hasValue).toBe('function');
      expect(typeof res.error).toBe('function');
      expect(typeof res.reload).toBe('function');
    });
  });
});
