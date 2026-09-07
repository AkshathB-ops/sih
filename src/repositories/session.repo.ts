import type { Session } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

export interface CreateSessionInput {
  tokenHash: string;
  userId: string;
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  return prisma.session.create({
    data: {
      tokenHash: input.tokenHash,
      userId: input.userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });
}

export async function findSessionWithUser(
  tokenHash: string,
): Promise<Session & { user: { id: string; email: string; name: string; role: string } } | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session;
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash } });
}