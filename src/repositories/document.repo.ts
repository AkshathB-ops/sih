import { Visibility } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";

export interface CreateDocumentInput {
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  visibility: Visibility;
  ownerId?: string | null;
  challengeId?: string | null;
  projectId?: string | null;
  uploadedById?: string | null;
}

export async function createDocument(input: CreateDocumentInput) {
  return prisma.document.create({ data: input });
}

export async function findDocumentById(id: string) {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) throw new NotFoundError("Document not found");
  return doc;
}

export async function deleteDocument(id: string) {
  await prisma.document.deleteMany({ where: { id } });
}