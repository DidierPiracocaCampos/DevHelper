import { Injectable, signal } from '@angular/core';
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';
import { ApiBase } from '../../api/api-base';
import { withDocById, withDocDelete, withSetDoc } from '../../api/crud.mixins';
import { CustomNasaImageI, UserPreferencesI } from '../models/preferences.model';

@Injectable({ providedIn: 'root' })
export class PreferencesRepository extends withDocDelete()(
  withSetDoc<UserPreferencesI>()(withDocById<UserPreferencesI>()(ApiBase<UserPreferencesI>)),
) {
  protected path = signal(['preferences'] as const);

  protected converter: FirestoreDataConverter<UserPreferencesI, DocumentData> = {
    toFirestore(data: UserPreferencesI): DocumentData {
      const out: DocumentData = { id: data.id };
      if (data.customNasaImage !== undefined) out['customNasaImage'] = data.customNasaImage;
      if (data.aiAssistantEnabled !== undefined)
        out['aiAssistantEnabled'] = data.aiAssistantEnabled;
      return out;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, _options: SnapshotOptions): UserPreferencesI {
      const data = snapshot.data() as {
        id?: unknown;
        customNasaImage?: CustomNasaImageI;
        aiAssistantEnabled?: boolean;
      };
      return {
        id: 'singleton',
        customNasaImage: data.customNasaImage,
        aiAssistantEnabled: data.aiAssistantEnabled,
      };
    },
  };

  readonly preferences = this.getDocResource('singleton');
}
