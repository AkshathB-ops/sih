import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { NotFoundError } from "@/lib/errors";
import { env } from "@/lib/config/env";

import type { StoredFile, StoredFileContent, StorageService } from "@/server/storage/storage-service";

export class LocalStorageService implements StorageService {
  private readonly baseDir: string;

  constructor(baseDir = resolve(env.storageLocalDir)) {
    this.baseDir = baseDir;
  }

  private keyToPath(key: string): string {
    // Keys are server-generated; reject any attempt to escape the base dir.
    const safe = key.replace(/[^a-zA-Z0-9._-]/g, "");
    const filePath = resolve(this.baseDir, safe);
    if (!filePath.startsWith(this.baseDir)) {
      throw new Error("Invalid storage key");
    }
    return filePath;
  }

  async putFile(key: string, data: Buffer, _mimeType: string): Promise<StoredFile> {
    const filePath = this.keyToPath(key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return { key, sizeBytes: data.byteLength };
  }

  async getFile(key: string): Promise<StoredFileContent> {
    const filePath = this.keyToPath(key);
    try {
      const data = await readFile(filePath);
      return { data, mimeType: "application/octet-stream" };
    } catch {
      throw new NotFoundError("File not found");
    }
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = this.keyToPath(key);
    await rm(filePath, { force: true });
  }
}