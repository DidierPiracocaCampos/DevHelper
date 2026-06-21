export interface BlobChunkI {
  index: number;
  data: Uint8Array;
}

export const BLOB_CHUNK_SIZE = 700 * 1024;
export const BLOB_MAX_FILE_SIZE = 5 * 1024 * 1024;

export type BlobNamespace = 'files' | 'nasa-image' | `proyectos/${string}/issues/${string}/files`;
