// Controlled challenge status state machine.
// Status can only change through this module, validated server-side.
// The client can never set a status directly.

import { ChallengeStatus, UserRole } from "@/generated/prisma/enums";

import { ConflictError, ForbiddenError } from "@/lib/errors";

interface TransitionRule {
  to: ChallengeStatus;
  roles: UserRole[];
}

const TRANSITIONS: Record<ChallengeStatus, TransitionRule[]> = {
  [ChallengeStatus.DRAFT]: [
    { to: ChallengeStatus.SUBMITTED, roles: [UserRole.CITIZEN, UserRole.GOVERNMENT, UserRole.ADMIN] },
  ],
  [ChallengeStatus.SUBMITTED]: [
    { to: ChallengeStatus.UNDER_REVIEW, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.VALIDATION_REQUIRED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.VALIDATED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.REJECTED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
  ],
  [ChallengeStatus.UNDER_REVIEW]: [
    { to: ChallengeStatus.VALIDATION_REQUIRED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.VALIDATED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.REJECTED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
  ],
  [ChallengeStatus.VALIDATION_REQUIRED]: [
    { to: ChallengeStatus.VALIDATED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.REJECTED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
  ],
  [ChallengeStatus.VALIDATED]: [
    { to: ChallengeStatus.MATCHING, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.ARCHIVED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
  ],
  [ChallengeStatus.MATCHING]: [
    { to: ChallengeStatus.ASSIGNED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.ARCHIVED, roles: [UserRole.GOVERNMENT, UserRole.ADMIN] },
  ],
  [ChallengeStatus.ASSIGNED]: [
    { to: ChallengeStatus.ACCEPTED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.GOVERNMENT, UserRole.ADMIN] },
    { to: ChallengeStatus.REJECTED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.GOVERNMENT, UserRole.ADMIN] },
  ],
  [ChallengeStatus.ACCEPTED]: [
    { to: ChallengeStatus.IN_PROGRESS, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
  ],
  [ChallengeStatus.IN_PROGRESS]: [
    { to: ChallengeStatus.PILOT, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY, UserRole.ADMIN] },
    { to: ChallengeStatus.RESOLVED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
    { to: ChallengeStatus.ARCHIVED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
  ],
  [ChallengeStatus.PILOT]: [
    { to: ChallengeStatus.VALIDATION, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY, UserRole.ADMIN] },
    { to: ChallengeStatus.IN_PROGRESS, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
    { to: ChallengeStatus.RESOLVED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
  ],
  [ChallengeStatus.VALIDATION]: [
    { to: ChallengeStatus.IMPLEMENTED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY, UserRole.ADMIN] },
    { to: ChallengeStatus.IN_PROGRESS, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
  ],
  [ChallengeStatus.IMPLEMENTED]: [
    { to: ChallengeStatus.RESOLVED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
    { to: ChallengeStatus.ARCHIVED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
  ],
  [ChallengeStatus.RESOLVED]: [
    { to: ChallengeStatus.ARCHIVED, roles: [UserRole.UNIVERSITY_ADMIN, UserRole.ADMIN] },
  ],
  [ChallengeStatus.REJECTED]: [],
  [ChallengeStatus.ARCHIVED]: [],
};

export function assertTransition(
  role: string,
  from: ChallengeStatus,
  to: ChallengeStatus,
): void {
  const rules = TRANSITIONS[from];
  if (!rules) {
    throw new ConflictError(`No transitions defined from ${from}`);
  }
  const rule = rules.find((r) => r.to === to);
  if (!rule) {
    throw new ConflictError(`Cannot transition from ${from} to ${to}`);
  }
  if (!rule.roles.includes(role as UserRole)) {
    throw new ForbiddenError(
      `Role ${role} is not permitted to transition ${from} → ${to}`,
    );
  }
}

export function isAllowedTransition(
  role: string,
  from: ChallengeStatus,
  to: ChallengeStatus,
): boolean {
  try {
    assertTransition(role, from, to);
    return true;
  } catch {
    return false;
  }
}

export function allowedNextStatuses(
  role: string,
  from: ChallengeStatus,
): ChallengeStatus[] {
  const rules = TRANSITIONS[from] ?? [];
  return rules.filter((r) => r.roles.includes(role as UserRole)).map((r) => r.to);
}