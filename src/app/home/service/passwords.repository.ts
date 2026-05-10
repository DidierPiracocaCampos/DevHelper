import { Injectable } from '@angular/core';
import { PasswordI } from '../domain/password.interface';
import { FirestoreDataConverter } from '@angular/fire/firestore';
import { ApiBase } from '../../shared/api/api-base';
import { withCollection } from '../../shared/api/crud.mixins';
import { withAddDoc } from '../../shared/api/crud.mixins';
import { withDocDelete } from '../../shared/api/crud.mixins';

@Injectable({
  providedIn: 'root',
})
export class PasswordRepository extends 
  withDocDelete<PasswordI>()(
    withAddDoc<PasswordI>()(
      withCollection<PasswordI>()(
        ApiBase<PasswordI>
      )
    )
  ) {

  protected path: [string, ...string[]] = ['passwords'];

  protected converter: FirestoreDataConverter<PasswordI> = {
    toFirestore: (data: PasswordI) => data,
    fromFirestore: (snap) => snap.data() as PasswordI
  };

}
