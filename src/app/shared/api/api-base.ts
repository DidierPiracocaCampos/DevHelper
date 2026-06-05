import {
  computed,
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Authenticator } from '../service/authenticator';
import { collection, Firestore, FirestoreDataConverter } from '@angular/fire/firestore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = abstract new (...args: any[]) => T;

export type PathSegments = readonly [string, ...string[]];

@Injectable()
export abstract class ApiBase<T extends { id?: string }> {
  protected _firestore = inject(Firestore);
  protected _auth = inject(Authenticator);
  protected _injector = inject(Injector);

  protected abstract path: Signal<PathSegments>;
  protected abstract converter: FirestoreDataConverter<T>;
  protected _user = this._auth.user;
  protected colRefSignal = computed(() => {
    const user = this._user();
    const segments = this.path();
    if (!user || !segments || segments.length === 0) return undefined;
    return runInInjectionContext(this._injector, () =>
      collection(this._firestore, 'users', user.uid, ...segments).withConverter(this.converter),
    );
  });

  $userCollectionRef(): Observable<ReturnType<typeof this.colRefSignal>> {
    return toObservable(this.colRefSignal);
  }
}
