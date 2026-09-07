import { ChallengeStatus } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function governmentOverview() {
  const [total, byStatus, byDomain, byDistrict, byPriority, validated, reviews, universities, industry, projects] =
    await Promise.all([
      prisma.challenge.count(),
      prisma.challenge.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.challenge.groupBy({ by: ["primaryDomain"], _count: { _all: true } }),
      prisma.challenge.groupBy({ by: ["district"], _count: { _all: true } }),
      prisma.challenge.groupBy({ by: ["priority"], _count: { _all: true } }),
      prisma.challenge.count({ where: { status: { in: [ChallengeStatus.VALIDATED, ChallengeStatus.MATCHING, ChallengeStatus.ASSIGNED, ChallengeStatus.ACCEPTED, ChallengeStatus.IN_PROGRESS, ChallengeStatus.PILOT, ChallengeStatus.VALIDATION, ChallengeStatus.IMPLEMENTED, ChallengeStatus.RESOLVED] } } }),
      prisma.challengeReview.count({ where: { decision: "APPROVED" } }),
      prisma.organization.count({ where: { orgType: "UNIVERSITY" } }),
      prisma.organization.count({ where: { orgType: { in: ["INDUSTRY", "STARTUP", "MSME", "CSR"] } } }),
      prisma.project.count(),
    ]);

  const submitted = byStatus.find((s) => s.status === ChallengeStatus.SUBMITTED)?._count._all ?? 0;
  const underReview =
    (byStatus.find((s) => s.status === ChallengeStatus.UNDER_REVIEW)?._count._all ?? 0) +
    (byStatus.find((s) => s.status === ChallengeStatus.VALIDATION_REQUIRED)?._count._all ?? 0);
  const assigned =
    (byStatus.find((s) => s.status === ChallengeStatus.ASSIGNED)?._count._all ?? 0) +
    (byStatus.find((s) => s.status === ChallengeStatus.MATCHING)?._count._all ?? 0);
  const activeStatuses: ChallengeStatus[] = [
    ChallengeStatus.ACCEPTED,
    ChallengeStatus.IN_PROGRESS,
    ChallengeStatus.PILOT,
    ChallengeStatus.VALIDATION,
  ];
  const active = byStatus
    .filter((s) => activeStatuses.includes(s.status))
    .reduce((sum, s) => sum + (s._count._all ?? 0), 0);
  const resolved =
    (byStatus.find((s) => s.status === ChallengeStatus.RESOLVED)?._count._all ?? 0) +
    (byStatus.find((s) => s.status === ChallengeStatus.IMPLEMENTED)?._count._all ?? 0);

  return {
    total,
    distribution: {
      byStatus,
      byDomain,
      byDistrict,
      byPriority,
    },
    funnel: { submitted, underReview, validated, assigned, active, resolved },
    participants: { universities, industry },
    projects,
  };
}

export async function universityOverview(organizationId: string) {
  const [assigned, activeProjects, completedProjects, faculty, students, collaborations] =
    await Promise.all([
      prisma.challenge.count({ where: { assignedOrganizationId: organizationId } }),
      prisma.project.count({
        where: { organizationId, status: { in: ["IN_PROGRESS", "PILOT", "VALIDATION"] } },
      }),
      prisma.project.count({ where: { organizationId, status: { in: ["COMPLETED"] } } }),
      prisma.faculty.count({ where: { organizationId } }),
      prisma.student.count({ where: { organizationId } }),
      prisma.industryCollaboration.count({ where: { organization: { id: organizationId } } }),
    ]);

  return { assigned, activeProjects, completedProjects, faculty, students, collaborations };
}

export async function industryOverview(organizationId: string) {
  const [collaborations, supportedProjects, mentorship, funding, pilots] = await Promise.all([
    prisma.industryCollaboration.count({ where: { organizationId } }),
    prisma.industryCollaboration.count({ where: { organizationId, projectId: { not: null } } }),
    prisma.industryCollaboration.count({ where: { organizationId, roles: { has: "MENTORSHIP" } } }),
    prisma.industryCollaboration.count({ where: { organizationId, roles: { has: "FUNDING" } } }),
    prisma.industryCollaboration.count({ where: { organizationId, roles: { has: "PILOT" } } }),
  ]);

  return { collaborations, supportedProjects, mentorship, funding, pilots };
}