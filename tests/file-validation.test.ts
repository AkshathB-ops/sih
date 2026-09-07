import { describe, expect, it } from "vitest";

import { EvidenceKind } from "@/generated/prisma/enums";
import {
  assertAllowedFile,
  detectEvidenceKind,
  extensionOf,
  validateUploadSize,
} from "@/server/storage/file-validation";

describe("file validation", () => {
  it("accepts allowed photos", () => {
    expect(detectEvidenceKind("evidence.jpg", "image/jpeg")).toBe(EvidenceKind.PHOTO);
    expect(detectEvidenceKind("evidence.png", "image/png")).toBe(EvidenceKind.PHOTO);
  });

  it("accepts documents", () => {
    expect(detectEvidenceKind("report.pdf", "application/pdf")).toBe(EvidenceKind.DOCUMENT);
    expect(detectEvidenceKind("data.csv", "text/csv")).toBe(EvidenceKind.DOCUMENT);
  });

  it("accepts videos within size limits", () => {
    expect(() => assertAllowedFile("clip.mp4", "video/mp4", 10 * 1024 * 1024)).not.toThrow();
  });

  it("rejects dangerous/unlisted extensions", () => {
    expect(() => detectEvidenceKind("evil.exe", "application/x-msdownload")).toThrow();
    expect(() => detectEvidenceKind("shell.php", "application/x-php")).toThrow();
  });

  it("falls back to the declared MIME when the extension is unknown", () => {
    expect(detectEvidenceKind("noextension", "video/mp4")).toBe(EvidenceKind.VIDEO);
    expect(detectEvidenceKind("file.xyz", "text/plain")).toBe(EvidenceKind.DOCUMENT);
  });

  it("rejects photos above 8MB", () => {
    expect(() => validateUploadSize(EvidenceKind.PHOTO, 9 * 1024 * 1024)).toThrow();
    expect(() => validateUploadSize(EvidenceKind.PHOTO, 1024)).not.toThrow();
  });

  it("rejects videos above 50MB", () => {
    expect(() => validateUploadSize(EvidenceKind.VIDEO, 51 * 1024 * 1024)).toThrow();
  });

  it("normalizes extensions to lowercase", () => {
    expect(extensionOf("PHOTO.JPG")).toBe(".jpg");
  });
});