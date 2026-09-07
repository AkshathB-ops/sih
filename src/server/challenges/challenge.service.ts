import { randomUUID } from "node:crypto";

import {
  ChallengeDomain,
  ChallengeStatus,
  ReviewDecision,
  type Challenge,
} from "@/generated/prisma/client";

import { getAIService } from "@/server/ai";
import { assertTransition } from "@/server/challenges/challenge-status";
import { calculatePriority } from "@/server/challenges/priority";
import { writeAuditLog } from "@/repositories/audit.repo";
import {
  addEvidence,
  assignToOrganization,
  changeStatus,
  createChallenge,
  createReview,
  deleteEvidence,
  findChallengeById,
  listChallenges,
  recentChallengeCandidates,
  updateChallenge,
} from "@/repositories/challenge.repo";
import { getStorageService } from "@/server/storage";
import { assertAllowedFile } from "@/server/storage";
import { notifyReviewFeedback, notifyStatusChange, notifySubmission } from "@/server/services/notification.service";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { hasPermission } from "@/lib/auth/rbac";
import type { SessionUser } from "@/types";
import type {
  AssignChallengeInput,
  CreateChallengeInput,
  ReviewChallengeInput,
  TransitionChallengeInput,
  UpdateChallengeInput,
} from "@/validations/challenge";

const PUBLIC_STATUSES = new Set<ChallengeStatus>([
  ChallengeStatus.VALIDATED,
  ChallengeStatus.MATCHING,
  ChallengeStatus.ASSIGNED,
  ChallengeStatus.ACCEPTED,
  ChallengeStatus.IN_PROGRESS,
  ChallengeStatus.PILOT,
  ChallengeStatus.VALIDATION,
  ChallengeStatus.IMPLEMENTED,
  ChallengeStatus.RESOLVED,
  ChallengeStatus.ARCHIVED,
]);

async function recordAudit(
  userId: string,
  challengeId: string,
  action: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await writeAuditLog({
    userId,
    action,
    entityType: "Challenge",
    entityId: challengeId,
    metadata,
  });
}

export async function createChallengeForUser(
  user: SessionUser,
  input: CreateChallengeInput,
): Promise<Challenge> {
  const ai = getAIService();

  const priorityInput = {
    urgency: input.urgency,
    affectedPopulation: input.affectedPopulation ?? null,
    geographicScope: input.geographicScope ?? null,
    tags: input.tags,
  };
  const priority =
    ai && input.asDraft === false
      ? (await ai.prioritizeChallenge(priorityInput)).priority
      : calculatePriority(priorityInput);

  let classification: unknown = null;
  let duplicateMeta: unknown = null;
  let summary: string | null = null;

  if (ai && input.asDraft === false) {
    const cls = await ai.classifyChallenge({
      title: input.title,
      description: input.description,
      tags: input.tags,
      primaryDomain: input.primaryDomain,
    });
    if (Object.values(ChallengeDomain).includes(cls.domain)) {
      classification = cls;
    }

    const candidates = await recentChallengeCandidates(100);
    duplicateMeta = await ai.detectDuplicates(
      {
        title: input.title,
        description: input.description,
        district: input.district,
        tags: input.tags,
      },
      candidates,
    );

    summary = (await ai.summarizeChallenge({ title: input.title, description: input.description })).summary;
  }

  const status =
    input.asDraft === true ? ChallengeStatus.DRAFT : ChallengeStatus.SUBMITTED;

  const created = await createChallenge({
    userId: user.id,
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
    priority,
    affectedPopulation: input.affectedPopulation ?? null,
    geographicScope: input.geographicScope ?? null,
    status,
    aiClassification: classification as never,
    aiDuplicateMeta: duplicateMeta as never,
    aiPriority: { priority, reasons: [] } as never,
    aiSummary: summary,
  });

  await recordAudit(
    user.id,
    created.id,
    status === ChallengeStatus.DRAFT ? "challenge.draft_created" : "challenge.submitted",
    { status },
  );

  if (status === ChallengeStatus.SUBMITTED) {
    await notifySubmission(user.id, created.id);
  }

  return created;
}

export async function updateChallengeForUser(
  user: SessionUser,
  challengeId: string,
  input: UpdateChallengeInput,
): Promise<Challenge> {
  const challenge = await findChallengeById(challengeId);
  if (challenge.userId !== user.id) {
    throw new ForbiddenError("Only the owner can edit this challenge");
  }
  const editableStatuses: ChallengeStatus[] = [ChallengeStatus.DRAFT, ChallengeStatus.SUBMITTED];
  if (!editableStatuses.includes(challenge.status)) {
    throw new ForbiddenError("This challenge can no longer be edited");
  }

  const updated = await updateChallenge(challengeId, input);
  await recordAudit(user.id, challengeId, "challenge.updated");
  return updated;
}

export async function submitDraft(
  user: SessionUser,
  challengeId: string,
): Promise<Challenge> {
  const challenge = await findChallengeById(challengeId);
  if (challenge.userId !== user.id) {
    throw new ForbiddenError("Only the owner can submit this challenge");
  }

  assertTransition(user.role, challenge.status, ChallengeStatus.SUBMITTED);

  const updated = await changeStatus({
    challengeId,
    fromStatus: challenge.status,
    toStatus: ChallengeStatus.SUBMITTED,
    changedById: user.id,
  });

  await recordAudit(user.id, challengeId, "challenge.submitted", { from: challenge.status });
  await notifySubmission(user.id, challengeId);
  return updated;
}

export async function listChallengesFor(
  user: SessionUser | null,
  params: {
    page: number;
    pageSize: number;
    status?: ChallengeStatus;
    district?: string;
    domain?: ChallengeDomain;
    priority?: string;
    search?: string;
    assignedTo?: string;
    mine?: boolean;
  },
) {
  const canViewAll = user ? hasPermission(user.role, "challenge:viewAll") : false;
  const ownOnly = Boolean(user && params.mine && !canViewAll);

  return listChallenges({
    page: params.page,
    pageSize: params.pageSize,
    status: params.status,
    statusIn: !canViewAll && !ownOnly ? [...PUBLIC_STATUSES] : undefined,
    district: params.district,
    domain: params.domain,
    priority: params.priority as never,
    search: params.search,
    assignedTo: params.assignedTo,
    ...(ownOnly ? { userId: user?.id } : {}),
  });
}

export async function getChallengeFor(user: SessionUser | null, challengeId: string) {
  const challenge = await findChallengeById(challengeId);
  const isAdmin = user ? hasPermission(user.role, "challenge:viewAll") : false;
  const isOwner = user?.id === challenge.userId;

  if (isAdmin || isOwner) {
    return { challenge, fullAccess: true };
  }

  if (!PUBLIC_STATUSES.has(challenge.status)) {
    throw new NotFoundError("Challenge not found");
  }

  return {
    challenge: {
      ...challenge,
      user: { id: challenge.user.id, name: challenge.user.name },
      evidence: challenge.evidence.filter((e) => e.visibility === "PUBLIC"),
      reviews: [],
    },
    fullAccess: false,
  };
}

const REVIEW_TARGET: Record<ReviewDecision, ChallengeStatus> = {
  [ReviewDecision.APPROVED]: ChallengeStatus.VALIDATED,
  [ReviewDecision.REJECTED]: ChallengeStatus.REJECTED,
  [ReviewDecision.REQUIRES_MORE_INFO]: ChallengeStatus.VALIDATION_REQUIRED,
};

export async function reviewChallenge(
  user: SessionUser,
  challengeId: string,
  input: ReviewChallengeInput,
): Promise<Challenge> {
  if (!hasPermission(user.role, "challenge:review")) {
    throw new ForbiddenError("You are not permitted to review challenges");
  }

  const challenge = await findChallengeById(challengeId);
  const target = REVIEW_TARGET[input.decision];
  assertTransition(user.role, challenge.status, target);

  await changeStatus({
    challengeId,
    fromStatus: challenge.status,
    toStatus: target,
    changedById: user.id,
    note: input.notes ?? `Review: ${input.decision.toLowerCase().replace(/_/g, " ")}`,
  });

  await createReview({
    challengeId,
    reviewerId: user.id,
    decision: input.decision,
    notes: input.notes,
    priority: input.priority,
  });

  if (input.priority) {
    await updateChallengePriority(challengeId, input.priority);
  }

  await recordAudit(user.id, challengeId, "challenge.reviewed", {
    decision: input.decision,
    priority: input.priority ?? "",
  });

  await notifyStatusChange(challenge.userId, challengeId, target);
  await notifyReviewFeedback(challenge.userId, challengeId);
  return findChallengeById(challengeId);
}

async function updateChallengePriority(challengeId: string, priority: string) {
  const { prisma } = await import("@/lib/db/prisma");
  return prisma.challenge.update({
    where: { id: challengeId },
    data: { priority: priority as never },
  });
}

export async function assignChallenge(
  user: SessionUser,
  challengeId: string,
  input: AssignChallengeInput,
): Promise<Challenge> {
  if (!hasPermission(user.role, "challenge:assign")) {
    throw new ForbiddenError("You are not permitted to assign challenges");
  }

  const challenge = await assignToOrganization({
    challengeId,
    organizationId: input.organizationId,
    assignedById: user.id,
    notes: input.notes,
  });

  await recordAudit(user.id, challengeId, "challenge.assigned", {
    organizationId: input.organizationId,
  });

  return challenge;
}

export async function transitionChallenge(
  user: SessionUser,
  challengeId: string,
  input: TransitionChallengeInput,
): Promise<Challenge> {
  if (!hasPermission(user.role, "challenge:transition")) {
    throw new ForbiddenError("You are not permitted to change challenge status");
  }

  const challenge = await findChallengeById(challengeId);
  assertTransition(user.role, challenge.status, input.toStatus);

  const updated = await changeStatus({
    challengeId,
    fromStatus: challenge.status,
    toStatus: input.toStatus,
    changedById: user.id,
    note: input.note,
  });

  await recordAudit(user.id, challengeId, "challenge.status_changed", {
    from: challenge.status,
    to: input.toStatus,
  });
  await notifyStatusChange(challenge.userId, challengeId, input.toStatus);

  return updated;
}

export interface EvidenceUpload {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  data: Buffer;
}

export async function uploadEvidence(
  user: SessionUser,
  challengeId: string,
  file: EvidenceUpload,
) {
  const challenge = await findChallengeById(challengeId);
  const isOwner = challenge.userId === user.id;
  const isAdmin = hasPermission(user.role, "challenge:viewAll");
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("You cannot add evidence to this challenge");
  }

  const kind = assertAllowedFile(file.originalName, file.mimeType, file.sizeBytes);
  const ext = file.originalName.includes(".")
    ? `.${file.originalName.split(".").pop()?.toLowerCase() ?? ""}`
    : "";
  const storageKey = `${randomUUID()}${ext}`;

  const storage = getStorageService();
  await storage.putFile(storageKey, file.data, file.mimeType);

  const evidence = await addEvidence({
    challengeId,
    kind,
    storageKey,
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    visibility: file.sizeBytes > 0 ? "PRIVATE" : "PRIVATE",
    uploadedById: user.id,
  });

  await recordAudit(user.id, challengeId, "challenge.evidence_uploaded", {
    kind,
    sizeBytes: file.sizeBytes,
  });

  return evidence;
}

export async function removeEvidence(
  user: SessionUser,
  challengeId: string,
  evidenceId: string,
) {
  const challenge = await findChallengeById(challengeId);
  const isOwner = challenge.userId === user.id;
  const isAdmin = hasPermission(user.role, "challenge:viewAll");
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("You cannot remove evidence from this challenge");
  }

  const evidence = await deleteEvidence(challengeId, evidenceId);
  const storage = getStorageService();
  await storage.deleteFile(evidence.storageKey);
  await recordAudit(user.id, challengeId, "challenge.evidence_deleted");
  return evidence;
}