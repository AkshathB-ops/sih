// Server-side RBAC policy.
// Roles are stored server-side; permission checks always happen on the server.
// The UI hides actions based on role for UX only — never for security.

import { UserRole } from "@/generated/prisma/enums";

import { ForbiddenError } from "@/lib/errors";
import type { Permission } from "@/types";

const ALL: ReadonlySet<Permission> = new Set([
  "challenge:create",
  "challenge:viewOwn",
  "challenge:viewAll",
  "challenge:review",
  "challenge:assign",
  "challenge:transition",
  "challenge:submitOwn",
  "challenge:comment",
  "project:create",
  "project:manage",
  "project:viewAll",
  "industry:expressInterest",
  "dashboard:gov",
  "dashboard:university",
  "dashboard:industry",
  "notifications:viewOwn",
]);

const PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  [UserRole.CITIZEN]: new Set([
    "challenge:create",
    "challenge:viewOwn",
    "challenge:submitOwn",
    "challenge:comment",
    "notifications:viewOwn",
  ]),
  [UserRole.GOVERNMENT]: new Set([
    "challenge:create",
    "challenge:viewOwn",
    "challenge:viewAll",
    "challenge:submitOwn",
    "challenge:review",
    "challenge:assign",
    "challenge:transition",
    "challenge:comment",
    "project:viewAll",
    "dashboard:gov",
    "notifications:viewOwn",
  ]),
  [UserRole.ADMIN]: ALL,
  [UserRole.UNIVERSITY_ADMIN]: new Set([
    "challenge:viewAll",
    "challenge:review",
    "challenge:transition",
    "challenge:comment",
    "project:create",
    "project:manage",
    "project:viewAll",
    "dashboard:university",
    "notifications:viewOwn",
  ]),
  [UserRole.FACULTY]: new Set([
    "challenge:viewAll",
    "challenge:comment",
    "project:create",
    "project:manage",
    "project:viewAll",
    "notifications:viewOwn",
  ]),
  [UserRole.STUDENT]: new Set([
    "challenge:viewAll",
    "challenge:comment",
    "notifications:viewOwn",
  ]),
  [UserRole.INDUSTRY]: new Set([
    "challenge:viewAll",
    "challenge:comment",
    "project:viewAll",
    "industry:expressInterest",
    "dashboard:industry",
    "notifications:viewOwn",
  ]),
  [UserRole.MENTOR]: new Set([
    "challenge:viewAll",
    "challenge:comment",
    "project:manage",
    "project:viewAll",
    "notifications:viewOwn",
  ]),
};

export function hasPermission(
  role: string,
  permission: Permission,
): boolean {
  return PERMISSIONS[role as UserRole]?.has(permission) ?? false;
}

export function assertPermission(
  role: string,
  permission: Permission,
): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(
      "You are not permitted to perform this action.",
    );
  }
}