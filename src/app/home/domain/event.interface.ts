import { Timestamp } from '@angular/fire/firestore';

export interface EventI {
  id?: string;
  title: string;
  description?: string;
  at: Timestamp;
  isAllDay: boolean;
  durationMinutes?: number;
  notified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventCreateInput = Omit<EventI, 'id' | 'createdAt' | 'updatedAt' | 'notified'>;

export type EventUpdateInput = Partial<Omit<EventI, 'id' | 'createdAt'>>;
