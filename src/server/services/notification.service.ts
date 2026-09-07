import { ChallengeStatus, NotificationType } from "@/generated/prisma/client";

import { createNotification } from "@/repositories/notification.repo";

// Domain-level notification helpers. Delivery channels (email/SMS/push) can be
// added later behind this service; Phase 1 delivers in-app notifications only.

export async function notifySubmission(userId: string, challengeId: string): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.CHALLENGE_SUBMISSION,
    title: "Challenge submitted",
    body: "Your challenge has been submitted and is awaiting review.",
    link: `/challenges/${challengeId}`,
  });
}

export async function notifyStatusChange(
  userId: string,
  challengeId: string,
  toStatus: ChallengeStatus,
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.CHALLENGE_STATUS,
    title: "Challenge status updated",
    body: `Your challenge is now ${toStatus.toLowerCase().replace(/_/g, " ")}.`,
    link: `/challenges/${challengeId}`,
  });
}

export async function notifyAssigned(
  userId: string,
  challengeId: string,
  organizationName: string,
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.CHALLENGE_ASSIGNMENT,
    title: "Challenge assigned",
    body: `Your challenge has been assigned to ${organizationName}.`,
    link: `/challenges/${challengeId}`,
  });
}

export async function notifyReviewFeedback(
  userId: string,
  challengeId: string,
): Promise<void> {
  await createNotification({
    userId,
    type: NotificationType.REVIEW_FEEDBACK,
    title: "Challenge review feedback",
    body: "An administrator has reviewed your challenge.",
    link: `/challenges/${challengeId}`,
  });
}

export async function notifyIndustryInterest(
  organizationUserId: string | null,
  challengeId: string,
  organizationName: string,
): Promise<void> {
  if (!organizationUserId) return;
  await createNotification({
    userId: organizationUserId,
    type: NotificationType.INDUSTRY_INTEREST,
    title: "Industry interest recorded",
    body: `${organizationName} has expressed interest in a challenge.`,
    link: `/challenges/${challengeId}`,
  });
}