export interface FileMetadataI {
  id?: string;
  name: string;
  mimeType: string;
  size: number;
  chunkCount: number;
  updatedAt: number;
  encrypted?: boolean;
  iv?: string | null;
  tags: string[];
  createdAt: number;
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
