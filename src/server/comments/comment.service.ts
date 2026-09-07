import type { SessionUser } from "@/types";
import { hasPermission } from "@/lib/auth/rbac";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  createComment,
  listCommentsByChallenge,
  listCommentsByProject,
  challengeExists,
} from "@/repositories/comment.repo";
import { writeAuditLog } from "@/repositories/audit.repo";

export async function addComment(
  user: SessionUser,
  input: { challengeId?: string; projectId?: string; content: string },
) {
  const canComment = hasPermission(user.role, "challenge:comment");
  if (!canComment) {
    throw new ForbiddenError("You are not permitted to comment");
  }

  if (!input.challengeId && !input.projectId) {
    throw new ForbiddenError("A comment must reference a challenge or a project");
  }

  const challengeId = input.challengeId ?? null;
  const projectId = input.projectId ?? null;
  if (challengeId && !(await challengeExists(challengeId))) {
    throw new NotFoundError("Challenge not found");
  }

  const comment = await createComment({
    authorId: user.id,
    content: input.content,
    challengeId,
    projectId,
  });

  await writeAuditLog({
    userId: user.id,
    action: "comment.created",
    entityType: "Comment",
    entityId: comment.id,
    metadata: { challengeId, projectId },
  });

  return comment;
}

export async function listForChallenge(challengeId: string) {
  if (!(await challengeExists(challengeId))) {
    throw new NotFoundError("Challenge not found");
  }
  return listCommentsByChallenge(challengeId);
}

export async function listForProject(projectId: string) {
  return listCommentsByProject(projectId);
}