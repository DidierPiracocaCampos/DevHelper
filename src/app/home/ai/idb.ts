import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, STORE_NAME, IDB_KEY_PREFIX } from './ai-intent.enum';
import { EMBEDDING_DIM } from './ai-intent.enum';
import type { AiResult } from './ai-result.model';
export type { AiResult };

export interface StoredEmbedding {
  uid: string;
  collection: 'proyectos' | 'issues' | 'passwords';
  docId: string;
  text: string;
  vector: number[];
  modelVersion: string;
  updatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function buildKey(uid: string, collection: string, docId: string): string {
  return `${IDB_KEY_PREFIX}${uid}::${collection}::${docId}`;
}

export function openAiDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('uid', 'uid', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

export function embedKey(uid: string, collection: string, docId: string): string {
  return buildKey(uid, collection, docId);
}

export async function getAllEmbeddings(uid: string): Promise<StoredEmbedding[]> {
  const db = await openAiDb();
  const all = await db.getAll(STORE_NAME);
  return all.filter((e: StoredEmbedding) => e.uid === uid);
}

export async function putEmbedding(emb: StoredEmbedding): Promise<void> {
  if (emb.vector.length !== EMBEDDING_DIM) {
    throw new Error(`Embedding must be ${EMBEDDING_DIM}-dimensional, got ${emb.vector.length}`);
  }
  const db = await openAiDb();
  const key = buildKey(emb.uid, emb.collection, emb.docId);
  await db.put(STORE_NAME, { ...emb, key });
}

export async function deleteEmbedding(
  uid: string,
  collection: string,
  docId: string,
): Promise<void> {
  const db = await openAiDb();
  await db.delete(STORE_NAME, buildKey(uid, collection, docId));
}

export async function clearAllEmbeddings(uid: string): Promise<void> {
  const db = await openAiDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const key of await tx.store.getAllKeys()) {
    if (String(key).startsWith(`${IDB_KEY_PREFIX}${uid}::`)) {
      await tx.store.delete(key);
    }
  }
  await tx.done;
}
