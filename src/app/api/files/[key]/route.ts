import { prisma } from "@/lib/db/prisma";
import { handle, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/server/auth/session.service";
import { getStorageService } from "@/server/storage";
import { ForbiddenError } from "@/lib/errors";

// Private files are served only to the challenge owner, uploaders or
// review/assignment-capable roles. Guests never see private evidence.
export const GET = handle(async (request: Request, ctx) => {
  const { key } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return ok({ error: { message: "Authentication required" } }, 401);
  }

  const evidence = await prisma.challengeEvidence.findUnique({ where: { storageKey: key } });
  if (!evidence) {
    return ok({ error: { message: "File not found" } }, 404);
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: evidence.challengeId },
    select: { userId: true },
  });
  if (!challenge) {
    return ok({ error: { message: "File not found" } }, 404);
  }

  const isOwner = challenge.userId === user.id;
  const isUploader = evidence.uploadedById === user.id;
  const canReview = ["GOVERNMENT", "ADMIN", "UNIVERSITY_ADMIN"].includes(user.role);
  if (!(isOwner || isUploader || canReview)) {
    throw new ForbiddenError("You do not have access to this file");
  }

  const storage = getStorageService();
  const file = await storage.getFile(key);
  if (!file) {
    return ok({ error: { message: "File not found" } }, 404);
  }

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(evidence.originalName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
});