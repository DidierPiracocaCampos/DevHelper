export type AiIntent =
  | 'list_pending'
  | 'list_done'
  | 'list_projects'
  | 'overdue'
  | 'today'
  | 'this_week'
  | 'by_project'
  | 'by_tag'
  | 'summary'
  | 'search'
  | 'unknown';

export const MODEL_VERSION = 'minilm-l12-v2-int8';
export const EMBEDDING_DIM = 384;

export const DB_NAME = 'devhelper-ai';
export const STORE_NAME = 'embeddings';
export const IDB_KEY_PREFIX = 'emb::';
