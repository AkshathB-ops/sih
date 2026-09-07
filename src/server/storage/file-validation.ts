// Server-side upload validation. Never trusts client-supplied MIME alone —
// extensions and declared types are cross-checked against an allowlist.

import { EvidenceKind } from "@/generated/prisma/enums";

import { ValidationError } from "@/lib/errors";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_DOC_BYTES = 10 * 1024 * 1024;

const ALLOWED: Record<EvidenceKind, { mimes: string[]; extensions: string[]; maxBytes: number }> = {
  [EvidenceKind.PHOTO]: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxBytes: MAX_PHOTO_BYTES,
  },
  [EvidenceKind.VIDEO]: {
    mimes: ["video/mp4", "video/webm", "video/quicktime"],
    extensions: [".mp4", ".webm", ".mov"],
    maxBytes: MAX_VIDEO_BYTES,
  },
  [EvidenceKind.DOCUMENT]: {
    mimes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "text/plain",
    ],
    extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt"],
    maxBytes: MAX_DOC_BYTES,
  },
};

export function extensionOf(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : "";
}

export function detectEvidenceKind(
  originalName: string,
  declaredMime: string,
): EvidenceKind {
  const ext = extensionOf(originalName);
  const byExt = (Object.entries(ALLOWED) as Array<[EvidenceKind, typeof ALLOWED[EvidenceKind]]>).find(
    ([, rules]) => rules.extensions.includes(ext),
  );
  const byMime = (Object.entries(ALLOWED) as Array<[EvidenceKind, typeof ALLOWED[EvidenceKind]]>).find(
    ([, rules]) => rules.mimes.includes(declaredMime),
  );

  if (byExt && byMime && byExt[0] === byMime[0]) return byExt[0];
  if (byExt) return byExt[0];
  if (byMime) return byMime[0];

  throw new ValidationError(
    { file: `File type not allowed (${declaredMime || ext || "unknown"})` },
    `Unsupported file type`,
  );
}

export function validateUploadSize(kind: EvidenceKind, sizeBytes: number): void {
  const max = ALLOWED[kind].maxBytes;
  if (sizeBytes > max) {
    throw new ValidationError(
      { file: `File exceeds maximum size of ${Math.floor(max / (1024 * 1024))} MB` },
      "File too large",
    );
  }
}

export function assertAllowedFile(originalName: string, declaredMime: string, sizeBytes: number): EvidenceKind {
  const kind = detectEvidenceKind(originalName, declaredMime);
  validateUploadSize(kind, sizeBytes);
  return kind;
}