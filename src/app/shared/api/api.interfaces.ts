import { ResourceRef } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";

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