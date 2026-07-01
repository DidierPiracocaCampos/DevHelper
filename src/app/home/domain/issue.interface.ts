import { Timestamp } from '@angular/fire/firestore';

export type IssueStatus = 'pending' | 'done' | null;
export type IssuePriority = 'normal' | 'high';

export interface IssueI {
  id?: string;
  title: string;
  description?: string;
  status: IssueStatus;
  isNote: boolean;
  priority: IssuePriority;
  dueAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type IssueCreateInput = Omit<IssueI, 'id' | 'createdAt' | 'updatedAt'>;

export type IssueUpdateInput = Partial<Omit<IssueI, 'id' | 'createdAt'>>;
