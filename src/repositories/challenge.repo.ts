import {
  AssignmentStatus,
  ChallengeDomain,
  ChallengePriority,
  ChallengeStatus,
  EvidenceKind,
  ReviewDecision,
  Visibility,
  Prisma,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";

function asJson(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null || value === undefined) {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
}

export interface CreateChallengeInput {
  userId: string;
  title: string;
  description: string;
  problemStatement?: string | null;
  district: string;
  block?: string | null;
  villageWard?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  primaryDomain: ChallengeDomain;
  secondaryDomains: ChallengeDomain[];
  tags: string[];
  urgency: ChallengePriority;
  priority: ChallengePriority;
  affectedPopulation?: string | null;
  geographicScope?: string | null;
  status: ChallengeStatus;
  aiClassification?: unknown;
  aiDuplicateMeta?: unknown;
  aiPriority?: unknown;
  aiSummary?: string | null;
}

export async function createChallenge(input: CreateChallengeInput) {
  return prisma.challenge.create({
    data: {
      userId: input.userId,
      title: input.title,
      description: input.description,
      problemStatement: input.problemStatement ?? null,
      district: input.district,
      block: input.block ?? null,
      villageWard: input.villageWard ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      primaryDomain: input.primaryDomain,
      secondaryDomains: input.secondaryDomains,
      tags: input.tags,
      urgency: input.urgency,
      priority: input.priority,
      affectedPopulation: input.affectedPopulation ?? null,
      geographicScope: input.geographicScope ?? null,
      status: input.status,
      aiClassification: asJson(input.aiClassification),
      aiDuplicateMeta: asJson(input.aiDuplicateMeta),
      aiPriority: asJson(input.aiPriority),
      aiSummary: input.aiSummary ?? null,
      submittedAt: input.status === ChallengeStatus.SUBMITTED ? new Date() : null,
    },
  });
}

export interface UpdateChallengeInput {
  title?: string;
  description?: string;
  problemStatement?: string | null;
  district?: string;
  block?: string | null;
  villageWard?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  primaryDomain?: ChallengeDomain;
  secondaryDomains?: ChallengeDomain[];
  tags?: string[];
  urgency?: ChallengePriority;
  affectedPopulation?: string | null;
  geographicScope?: string | null;
}

export async function updateChallenge(id: string, input: UpdateChallengeInput) {
  return prisma.challenge.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.problemStatement !== undefined && { problemStatement: input.problemStatement ?? null }),
      ...(input.district !== undefined && { district: input.district }),
      ...(input.block !== undefined && { block: input.block ?? null }),
      ...(input.villageWard !== undefined && { villageWard: input.villageWard ?? null }),
      ...(input.latitude !== undefined && { latitude: input.latitude ?? null }),
      ...(input.longitude !== undefined && { longitude: input.longitude ?? null }),
      ...(input.primaryDomain !== undefined && { primaryDomain: input.primaryDomain }),
      ...(input.secondaryDomains !== undefined && { secondaryDomains: input.secondaryDomains }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.urgency !== undefined && { urgency: input.urgency }),
      ...(input.affectedPopulation !== undefined && { affectedPopulation: input.affectedPopulation ?? null }),
      ...(input.geographicScope !== undefined && { geographicScope: input.geographicScope ?? null }),
    },
  });
}

export interface ChallengeListParams {
  page: number;
  pageSize: number;
  status?: ChallengeStatus;
  statusIn?: ChallengeStatus[];
  district?: string;
  domain?: ChallengeDomain;
  priority?: ChallengePriority;
  search?: string;
  assignedTo?: string;
  userId?: string;
}

export async function listChallenges(params: ChallengeListParams) {
  const statusFilter = params.status
    ? { status: params.status }
    : params.statusIn
      ? { status: { in: params.statusIn } }
      : {};

  const where: Prisma.ChallengeWhereInput = {
    ...statusFilter,
    ...(params.district && { district: params.district }),
    ...(params.domain && {
      OR: [{ primaryDomain: params.domain }, { secondaryDomains: { has: params.domain } }],
    }),
    ...(params.priority && { priority: params.priority }),
    ...(params.userId && { userId: params.userId }),
    ...(params.assignedTo && { assignedOrganizationId: params.assignedTo }),
    ...(params.search && {
      OR: [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { tags: { has: params.search } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        user: { select: { id: true, name: true } },
        assignedOrganization: { select: { id: true, name: true } },
      },
    }),
    prisma.challenge.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}

export async function findChallengeById(id: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      evidence: true,
      reviews: {
        include: { reviewer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        include: { organization: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
      assignedOrganization: { select: { id: true, name: true } },
      projects: true,
    },
  });

  if (!challenge) throw new NotFoundError("Challenge not found");
  return challenge;
}

export async function changeStatus(params: {
  challengeId: string;
  fromStatus: ChallengeStatus;
  toStatus: ChallengeStatus;
  changedById: string | null;
  note?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const challenge = await tx.challenge.findUnique({ where: { id: params.challengeId } });
    if (!challenge) throw new NotFoundError("Challenge not found");
    if (challenge.status !== params.fromStatus) {
      throw new ConflictError(
        `Challenge is currently ${challenge.status}, expected ${params.fromStatus}`,
      );
    }

    const updated = await tx.challenge.update({
      where: { id: params.challengeId },
      data: {
        status: params.toStatus,
        reviewedAt: params.toStatus === ChallengeStatus.REJECTED ? new Date() : challenge.reviewedAt,
      },
    });

    await tx.challengeStatusHistory.create({
      data: {
        challengeId: params.challengeId,
        fromStatus: params.fromStatus === params.toStatus ? null : params.fromStatus,
        toStatus: params.toStatus,
        changedById: params.changedById ?? null,
        note: params.note ?? null,
      },
    });

    return updated;
  });
}

export async function createReview(params: {
  challengeId: string;
  reviewerId: string;
  decision: ReviewDecision;
  notes?: string | null;
  priority?: ChallengePriority | null;
}) {
  return prisma.challengeReview.create({
    data: {
      challengeId: params.challengeId,
      reviewerId: params.reviewerId,
      decision: params.decision,
      notes: params.notes ?? null,
      priority: params.priority ?? null,
    },
  });
}

export async function createAssignment(params: {
  challengeId: string;
  organizationId: string;
  assignedById: string | null;
  notes?: string | null;
  status?: AssignmentStatus;
}) {
  return prisma.challengeAssignment.upsert({
    where: {
      challengeId_organizationId: {
        challengeId: params.challengeId,
        organizationId: params.organizationId,
      },
    },
    update: {},
    create: {
      challengeId: params.challengeId,
      organizationId: params.organizationId,
      assignedById: params.assignedById ?? null,
      notes: params.notes ?? null,
      status: params.status ?? AssignmentStatus.PENDING,
    },
  });
}

// Assigns a VALIDATATEd or MATCHING challenge to an organization, recording the
// Assignment and the status history entries in a single transaction.
export async function assignToOrganization(params: {
  challengeId: string;
  organizationId: string;
  assignedById: string;
  notes?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const challenge = await tx.challenge.findUnique({ where: { id: params.challengeId } });
    if (!challenge) throw new NotFoundError("Challenge not found");

    if (challenge.assignedOrganizationId === params.organizationId) {
      throw new ConflictError("Challenge is already assigned to this organization");
    }

    const assignableStatuses: ChallengeStatus[] = [
      ChallengeStatus.VALIDATED,
      ChallengeStatus.MATCHING,
    ];
    if (!assignableStatuses.includes(challenge.status)) {
      throw new ConflictError(
        `Challenge must be VALIDATED or MATCHING to be assigned, currently ${challenge.status}`,
      );
    }

    await tx.challengeAssignment.upsert({
      where: {
        challengeId_organizationId: {
          challengeId: params.challengeId,
          organizationId: params.organizationId,
        },
      },
      update: {},
      create: {
        challengeId: params.challengeId,
        organizationId: params.organizationId,
        assignedById: params.assignedById,
        notes: params.notes ?? null,
        status: AssignmentStatus.PENDING,
      },
    });

    if (challenge.status === ChallengeStatus.VALIDATED) {
      await tx.challengeStatusHistory.create({
        data: {
          challengeId: params.challengeId,
          fromStatus: ChallengeStatus.VALIDATED,
          toStatus: ChallengeStatus.MATCHING,
          changedById: params.assignedById,
          note: "Challenge entered matching",
        },
      });
    }

    await tx.challengeStatusHistory.create({
      data: {
        challengeId: params.challengeId,
        fromStatus: challenge.status,
        toStatus: ChallengeStatus.ASSIGNED,
        changedById: params.assignedById,
        note: params.notes ?? null,
      },
    });

    return tx.challenge.update({
      where: { id: params.challengeId },
      data: {
        assignedOrganizationId: params.organizationId,
        status: ChallengeStatus.ASSIGNED,
      },
    });
  });
}

export async function addEvidence(params: {
  challengeId: string;
  kind: EvidenceKind;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  visibility: Visibility;
  uploadedById: string | null;
}) {
  return prisma.challengeEvidence.create({ data: params });
}

export async function deleteEvidence(challengeId: string, evidenceId: string) {
  const evidence = await prisma.challengeEvidence.findFirst({
    where: { id: evidenceId, challengeId },
  });
  if (!evidence) throw new NotFoundError("Evidence not found");
  await prisma.challengeEvidence.delete({ where: { id: evidenceId } });
  return evidence;
}

export async function recentChallengeCandidates(limit = 100) {
  return prisma.challenge.findMany({
    where: { status: { not: ChallengeStatus.DRAFT } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      district: true,
      tags: true,
    },
  });
}