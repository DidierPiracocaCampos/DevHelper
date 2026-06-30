import { Injectable, resource, runInInjectionContext, signal, Signal } from '@angular/core';
import {
  FirestoreDataConverter,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from '@angular/fire/firestore';
import { ApiBase } from '../../shared/api/api-base';
import {
  withCollection,
  withAddDoc,
  withUpdateDoc,
  withDocDelete,
} from '../../shared/api/crud.mixins';
import { EventI, EventCreateInput, EventUpdateInput } from '../domain/event.interface';
import { startOfDay, endOfDay } from '../utils/calendar.utils';

@Injectable({
  providedIn: 'root',
})
export class EventRepository extends withDocDelete<EventI>()(
  withUpdateDoc<EventI>()(withAddDoc<EventI>()(withCollection<EventI>()(ApiBase<EventI>))),
) {
  protected path = signal(['events'] as const);

  protected converter: FirestoreDataConverter<EventI> = {
    toFirestore: (data: EventI) => {
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore: (snap) => snap.data() as EventI,
  };

  addEvent(input: EventCreateInput) {
    const now = Timestamp.now();
    const payload: EventI = {
      ...input,
      notified: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.addDoc(payload);
  }

  updateEvent(id: string, patch: EventUpdateInput) {
    return this.updateDoc(id, { ...patch, updatedAt: Timestamp.now() });
  }

  eventsOfDay$(day: Signal<Date>) {
    return resource({
      params: () => ({ day: day(), ref: this.colRefSignal() }),
      loader: ({ params }) => {
        if (!params.ref) return Promise.resolve([] as EventI[]);
        const ref = params.ref;
        return runInInjectionContext(this['_injector'], async () => {
          const sod = startOfDay(params.day);
          const eod = endOfDay(params.day);
          const q = query(
            ref,
            where('at', '>=', Timestamp.fromDate(sod)),
            where('at', '<=', Timestamp.fromDate(eod)),
            orderBy('at'),
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...(d.data() as EventI) }));
        });
      },
    });
  }
}
