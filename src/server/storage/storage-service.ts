// Storage abstraction. The application only depends on this interface.
// Phase 1 uses local disk; S3/cloud providers can be added without touching
// callers (see local-storage.ts and file-validation.ts).

export interface StoredFile {
  key: string;
  sizeBytes: number;
}

export interface StoredFileContent {
  data: Buffer;
  mimeType: string;
}

export interface StorageService {
  putFile(key: string, data: Buffer, mimeType: string): Promise<StoredFile>;
  getFile(key: string): Promise<StoredFileContent>;
  deleteFile(key: string): Promise<void>;
}