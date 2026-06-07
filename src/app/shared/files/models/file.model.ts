export interface FileMetadataI {
  id?: string;
  name: string;
  size: number;
  type: string;
  chunkCount: number;
  updatedAt: number;
}

export type FileItemStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface FileItem {
  kind: 'local' | 'remote';
  localId: string;
  file?: File;
  metadata?: FileMetadataI;
  progress: number;
  status: FileItemStatus;
  error?: string;
}
