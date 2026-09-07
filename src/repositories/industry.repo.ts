import {
  IndustryCollaborationStatus,
  OrganizationType,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";

export async function createIndustryInterest(params: {
  organizationId: string;
  challengeId: string;
  roles: string[];
  notes?: string | null;
}) {
  return prisma.industryCollaboration.upsert({
    where: {
      organizationId_challengeId: { organizationId: params.organizationId, challengeId: params.challengeId },
    },
    update: { roles: params.roles, notes: params.notes ?? null },
    create: {
      organizationId: params.organizationId,
      challengeId: params.challengeId,
      roles: params.roles,
      notes: params.notes ?? null,
      status: IndustryCollaborationStatus.INTERESTED,
    },
  });
}

export async function listIndustryCollaborationsByOrg(organizationId: string) {
  return prisma.industryCollaboration.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      challenge: { select: { id: true, title: true, status: true } },
      project: { select: { id: true, title: true } },
    },
  });
}

export async function findOrganizationIdForUser(
  userId: string,
  types: OrganizationType[],
): Promise<string> {
  const member = await prisma.organizationMember.findFirst({
    where: { userId, organization: { orgType: { in: types } } },
    select: { organizationId: true },
  });
  if (!member) {
    throw new NotFoundError(
      "No matching organization profile is linked to this account",
    );
  }
  return member.organizationId;
}

export async function countIndustryParticipation(): Promise<number> {
  const byOrg = await prisma.industryCollaboration.groupBy({
    by: ["organizationId"],
  });
  return byOrg.length;
}