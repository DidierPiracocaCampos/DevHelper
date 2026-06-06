export interface FileMetadataI {
  id?: string;
  name: string;
  size: number;
  type: string;
  storagePath: string;
  uploadedAt: number;
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
