import { Injectable, computed, signal } from '@angular/core';
import { Timestamp, FirestoreDataConverter } from '@angular/fire/firestore';
import { ApiBase } from '../../shared/api/api-base';
import {
  withCollection,
  withAddDoc,
  withUpdateDoc,
  withDocDelete,
  withQuery,
} from '../../shared/api/crud.mixins';
import { ProjectI, ProjectCreateInput, ProjectUpdateInput } from '../domain/project.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectRepository extends withQuery<ProjectI>()(
  withUpdateDoc<ProjectI>()(
    withDocDelete<ProjectI>()(
      withAddDoc<ProjectI>()(withCollection<ProjectI>()(ApiBase<ProjectI>)),
    ),
  ),
) {
  protected path = signal(['proyectos'] as const);

  readonly allDocs = computed<ProjectI[]>(() =>
    (this.getCollection().value() ?? []).filter((p) => !p.archived),
  );

  protected converter: FirestoreDataConverter<ProjectI> = {
    toFirestore: (data: ProjectI) => {
      const { id: _id, ...rest } = data;
      return rest;
    },
    fromFirestore: (snap) => snap.data() as ProjectI,
  };

  addProject(input: ProjectCreateInput) {
    const now = Timestamp.now();
    const payload: ProjectI = {
      ...input,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.addDoc(payload);
  }

  updateProject(id: string, patch: ProjectUpdateInput) {
    return this.updateDoc(id, { ...patch, updatedAt: Timestamp.now() });
  }

  archiveProject(id: string, archived: boolean) {
    return this.updateProject(id, { archived });
  }

  deleteProject(id: string) {
    return this.deleteDoc(id);
  }
}
