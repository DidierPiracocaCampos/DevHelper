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
import {
  CollectionReference,
  collection,
  DocumentData,
  Firestore,
  FirestoreDataConverter,
} from '@angular/fire/firestore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = abstract new (...args: any[]) => T;

export type PathSegments = readonly [string, ...string[]];

export type ColRef<T> = CollectionReference<T, DocumentData> | undefined;

@Injectable()
export abstract class ApiBase<T extends { id?: string }> {
  protected _firestore = inject(Firestore);
  protected _auth = inject(Authenticator);
  protected _injector = inject(Injector);

  protected get injector() {
    return this._injector;
  }

  protected abstract path: Signal<PathSegments>;
  protected abstract converter: FirestoreDataConverter<T>;
  protected _user = this._auth.user;
  protected colRefSignal = computed<ColRef<T>>(() => {
    const user = this._user();
    const segments = this.path();
    if (!user || !segments || segments.length === 0) return undefined;
    return runInInjectionContext(this._injector, () =>
      collection(this._firestore, 'users', user.uid, ...segments).withConverter(this.converter),
    );
  });

  // Memoize the observable in a field initializer so toObservable() is called
  // in an injection context (the abstract class is constructed inside one).
  readonly $userCollectionRef: Observable<ColRef<T>> = toObservable(this.colRefSignal);
}
