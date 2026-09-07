import { env } from "@/lib/config/env";

import { LocalStorageService } from "@/server/storage/local-storage";
import type { StorageService } from "@/server/storage/storage-service";

export function getStorageService(): StorageService {
  switch (env.storageDriver) {
    case "s3":
      // S3 adapter is a future integration point. The interface stays the same.
      throw new Error("S3 storage driver is not implemented in Phase 1");
    case "local":
    default:
      return new LocalStorageService();
  }
}

export type { StoredFile, StoredFileContent, StorageService } from "@/server/storage/storage-service";
export { assertAllowedFile, detectEvidenceKind, validateUploadSize } from "@/server/storage/file-validation";