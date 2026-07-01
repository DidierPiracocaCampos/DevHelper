import { Timestamp } from '@angular/fire/firestore';

export interface ProjectI {
  id?: string;
  name: string;
  tag?: string;
  description?: string;
  archived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ProjectCreateInput = Pick<ProjectI, 'name'> &
  Partial<Pick<ProjectI, 'tag' | 'description'>>;

export type ProjectUpdateInput = Partial<
  Pick<ProjectI, 'name' | 'tag' | 'description' | 'archived'>
>;
