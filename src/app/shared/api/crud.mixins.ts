import { resource, runInInjectionContext } from "@angular/core";
import { ApiBase, Constructor } from "./api-base";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { filter } from "rxjs/internal/operators/filter";
import { addDoc, collectionData, CollectionReference, deleteDoc, doc, docData, DocumentData, getCountFromServer, getDocs, getDoc, limit, orderBy, query, runTransaction, setDoc, startAfter, updateDoc, where, QueryDocumentSnapshot, Transaction } from "@angular/fire/firestore";
import { AddDocFeature, CountFeature, DeleteDocFeature, GetCollectionFeature, GetDocFeature, PaginationFeature, PaginationResult, QueryFeature, QueryOptions, SetDocFeature, TransactionFeature, UpdateDocFeature } from "./api.interfaces";
import { switchMap } from "rxjs/internal/operators/switchMap";
import { from } from "rxjs/internal/observable/from";
import { map } from "rxjs/internal/operators/map";
import { of } from "rxjs/internal/observable/of";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";

export function withCollection<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<GetCollectionFeature<T>> & TBase {

    abstract class GetAllMixin extends Base implements GetCollectionFeature<T> {
      readonly getCollectionResource = resource({
        loader: async () => {
          const ref = await firstValueFrom(
            this.$userCollectionRef().pipe(
              filter((r): r is CollectionReference<T> => !!r)
            )
          );
          if (!ref) return [];
          return runInInjectionContext(this._injector, async () => {
            const data = await firstValueFrom(
              collectionData(ref, { idField: 'id' })
            );
            return data as (T & { id: string })[];
          });
        }
      });
      getCollection() {
        return this.getCollectionResource;
      }
    }
    return GetAllMixin;
  };
}

export function withDocById<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<GetDocFeature<T>> & TBase {
    abstract class GetDocMixin extends Base implements GetDocFeature<T> {
      getDocResource(id: string) {
        return resource({
          loader: async () => {
            const ref = await firstValueFrom(this.$userCollectionRef());
            if (!ref) return null;
            return await firstValueFrom(
              runInInjectionContext(this._injector, () => {
                const docRef = doc(ref, id);
                return docData(docRef, { idField: 'id' })
              }
              )
            );
          }
        });
      }
    }
    return GetDocMixin;
  };
}

export function withDocExists<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(Base: TBase) {

    abstract class ExistsMixin extends Base {

      docExists(id: string) {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) return of(false);

            const docRef = doc(ref, id);

            return from(getDoc(docRef)).pipe(
              map(snap => snap.exists()),
              catchError(() => of(false))
            );
          })
        );
      }
    }

    return ExistsMixin;
  };
}

export function withAddDoc<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<AddDocFeature<T>> & TBase {
    abstract class AddDocMixin extends Base implements AddDocFeature<T> {
      addDoc(item: T) {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) {
              return throwError(() => new Error('No collection ref'));
            }

            return runInInjectionContext(this._injector, () =>
              from(addDoc(ref, item)).pipe(
                map(docRef => ({
                  id: docRef.id,
                  ...item
                } as T & { id: string }))
              )
            );
          })
        );
      }
    }
    return AddDocMixin;
  };
}

export function withUpdateDoc<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<UpdateDocFeature<T>> & TBase {

    abstract class UpdateDocMixin extends Base implements UpdateDocFeature<T> {

      updateDoc(id: string, data: Partial<T>) {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) return throwError(() => new Error('Collection reference not available'));;
            return runInInjectionContext(this._injector, () => {
              const docRef = doc(ref, id);
              const _data: DocumentData = { ...data };
              return from(updateDoc(docRef, _data));
            });
          })
        );
      }
    }
    return UpdateDocMixin;
  };
}

export function withSetDoc<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<SetDocFeature<T>> & TBase {

    abstract class SetDocMixin extends Base implements SetDocFeature<T> {
      setDoc(id: string, data: Partial<T>) {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) return throwError(() => new Error('Collection reference not available'));;
            return runInInjectionContext(this._injector, () => {
              const docRef = doc(ref, id);
              return from(setDoc(docRef, data, { merge: true }));
            });
          })
        );
      }
    }
    return SetDocMixin;
  };
}

export function withDocDelete<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<DeleteDocFeature> & TBase {

    abstract class DeleteDocMixin extends Base implements DeleteDocFeature {
      deleteDoc(id: string) {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) return throwError(() => new Error('Collection reference not available'));;
            return runInInjectionContext(this._injector, () => {
              const docRef = doc(ref, id);
              return from(deleteDoc(docRef));
            });
          })
        );
      }
    }
    return DeleteDocMixin;
  };
}

export function withQuery<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<QueryFeature<T>> & TBase {

    abstract class QueryMixin extends Base implements QueryFeature<T> {
      getFilteredCollection(options: QueryOptions) {
        return resource({
          loader: async () => {
            const ref = await firstValueFrom(
              this.$userCollectionRef().pipe(
                filter((r): r is CollectionReference<T> => !!r)
              )
            );
            if (!ref) return [];

            return runInInjectionContext(this._injector, async () => {
              let q: any = ref;

              if (options.filters) {
                for (const [field, op, value] of options.filters) {
                  q = query(q, where(field, op, value));
                }
              }

              if (options.orderBy) {
                q = query(q, orderBy(options.orderBy[0], options.orderBy[1]));
              }

              if (options.limit) {
                q = query(q, limit(options.limit));
              }

              const snapshot = await getDocs(q);
              return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as T) } as T & { id: string }));
            });
          }
        });
      }
    }
    return QueryMixin;
  };
}

export function withTransaction<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<TransactionFeature> & TBase {

    abstract class TransactionMixin extends Base implements TransactionFeature {
      runTransaction<TResult>(fn: (tx: Transaction) => Promise<TResult>) {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) return throwError(() => new Error('Collection reference not available'));
            return runInInjectionContext(this._injector, () =>
              from(runTransaction(this._firestore, fn))
            );
          })
        );
      }
    }
    return TransactionMixin;
  };
}

export function withPagination<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<PaginationFeature<T>> & TBase {

    abstract class PaginationMixin extends Base implements PaginationFeature<T> {
      getPaginatedCollection(pageSize: number, options?: QueryOptions, cursor?: QueryDocumentSnapshot<T>) {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) return throwError(() => new Error('Collection reference not available'));

            return runInInjectionContext(this._injector, () =>
              from(this.getPage(ref, pageSize, options, cursor))
            );
          })
        );
      }

      private async getPage(
        ref: CollectionReference<T>,
        pageSize: number,
        options?: QueryOptions,
        cursor?: QueryDocumentSnapshot<T>
      ): Promise<PaginationResult<T>> {
        let q: any = ref;

        if (options?.filters) {
          for (const [field, op, value] of options.filters) {
            q = query(q, where(field, op, value));
          }
        }

        if (options?.orderBy) {
          q = query(q, orderBy(options.orderBy[0], options.orderBy[1]));
        }

        if (cursor) {
          q = query(q, startAfter(cursor));
        }

        q = query(q, limit(pageSize + 1));

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;

        const hasNextPage = docs.length > pageSize;
        const pageDocs = hasNextPage ? docs.slice(0, pageSize) : docs;

        return {
          data: pageDocs.map(d => ({ id: d.id, ...(d.data() as T) } as T & { id: string })),
          nextCursor: hasNextPage ? (docs[docs.length - 1] as QueryDocumentSnapshot<T>) : undefined
        };
      }
    }
    return PaginationMixin;
  };
}

export function withCount<T extends { id?: string }>() {
  return function <TBase extends Constructor<ApiBase<T>>>(
    Base: TBase
  ): Constructor<CountFeature> & TBase {

    abstract class CountMixin extends Base implements CountFeature {
      getCount() {
        return this.$userCollectionRef().pipe(
          switchMap(ref => {
            if (!ref) return of(0);
            return runInInjectionContext(this._injector, () =>
              from(getCountFromServer(ref)).pipe(
                map(snapshot => snapshot.data().count)
              )
            );
          })
        );
      }
    }
    return CountMixin;
  };
}