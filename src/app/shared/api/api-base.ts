import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Authenticator } from '../service/authenticator';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { User } from '@angular/fire/auth';
import { collection, Firestore, FirestoreDataConverter } from '@angular/fire/firestore';

export type Constructor<T = {}> = abstract new (...args: any) => T

@Injectable()
export abstract class ApiBase<T extends { id?: string }> {

  protected _firestore = inject(Firestore);
  protected _auth = inject(Authenticator);
  protected _injector = inject(Injector);

  protected abstract path: [string, ...string[]];
  protected abstract converter: FirestoreDataConverter<T>;
  protected _user = this._auth.user;
  protected colRefSignal = toSignal(this.$userCollectionRef(), { initialValue: undefined });

  $userCollectionRef() {
    return this._auth.$userObservable().pipe(
      filter((u): u is User => !!u),
      map(u => {
        if (u) {
          return runInInjectionContext(this._injector, () =>
            collection(
              this._firestore,
              'users',
              u.uid,
              ...this.path
            ).withConverter(this.converter));
        }
        return undefined;
      }));
  }

}
