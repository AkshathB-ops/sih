import { prisma } from "@/lib/db/prisma";

export async function createComment(params: {
  authorId: string;
  content: string;
  challengeId?: string | null;
  projectId?: string | null;
}) {
  return prisma.comment.create({
    data: {
      authorId: params.authorId,
      content: params.content,
      challengeId: params.challengeId ?? null,
      projectId: params.projectId ?? null,
    },
  });
}

export async function listCommentsByChallenge(challengeId: string) {
  return prisma.comment.findMany({
    where: { challengeId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
}

export async function listCommentsByProject(projectId: string) {
  return prisma.comment.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
}

export async function challengeExists(challengeId: string): Promise<boolean> {
  const count = await prisma.challenge.count({ where: { id: challengeId } });
  return count > 0;
}