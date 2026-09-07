import { cookies } from "next/headers";

import { hashToken, readSessionToken } from "@/lib/auth/session";
import { assertPermission, hasPermission } from "@/lib/auth/rbac";
import { UnauthenticatedError, ForbiddenError } from "@/lib/errors";
import { findSessionWithUser, deleteSession } from "@/repositories/session.repo";
import type { SessionUser, Permission } from "@/types";

// Resolves the current user from the httpOnly session cookie.
// Works in Server Components, Route Handlers and Server Actions.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = readSessionToken(store);
  if (!token) return null;

  const session = await findSessionWithUser(hashToken(token));
  if (!session) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError("You must be signed in");
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  assertPermission(user.role, permission);
  return user;
}

export async function currentUserHas(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return hasPermission(user.role, permission);
}

export function assertOwnership(actorId: string, ownerId: string): void {
  if (actorId !== ownerId) {
    throw new ForbiddenError("You do not have access to this resource");
  }
}

export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = readSessionToken(store);
  if (token) {
    await deleteSession(hashToken(token));
  }
}