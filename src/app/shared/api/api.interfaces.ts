import { ResourceRef } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { OrderByDirection, WhereFilterOp } from "@angular/fire/firestore";
import { QueryDocumentSnapshot } from "firebase/firestore";

export interface GetCollectionFeature<T> {
    getCollection(): ResourceRef<(T & { id: string; })[] | undefined>;
}

export interface GetDocFeature<T> {
    getDocResource(id: string): ResourceRef<T | null | undefined>;
}

export interface AddDocFeature<T> {
    addDoc(item: T): Observable<T & { id: string }>;
}

export interface UpdateDocFeature<T> {
    updateDoc(id: string, data: Partial<T>): Observable<void>;
}

export interface SetDocFeature<T> {
    setDoc(id: string, data: Partial<T>): Observable<void>;
}

export interface DeleteDocFeature {
    deleteDoc(id: string): Observable<void>;
}

export interface QueryOptions {
    filters?: [string, WhereFilterOp, unknown][];
    orderBy?: [string, OrderByDirection];
    limit?: number;
}

export interface QueryFeature<T> {
    getFilteredCollection(options: QueryOptions): ResourceRef<(T & { id: string })[] | undefined>;
}

export interface TransactionFeature {
    runTransaction<T>(fn: (tx: unknown) => Promise<T>): Observable<T>;
}

export interface PaginationResult<T> {
    data: (T & { id: string })[];
    nextCursor?: QueryDocumentSnapshot<T>;
}

export interface PaginationFeature<T> {
    getPaginatedCollection(pageSize: number, options?: QueryOptions, cursor?: QueryDocumentSnapshot<T>): Observable<PaginationResult<T>>;
}

export interface CountFeature {
    getCount(): Observable<number>;
}