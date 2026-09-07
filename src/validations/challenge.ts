import { z } from "zod";

import {
  ChallengeDomain,
  ChallengePriority,
  ChallengeStatus,
  ReviewDecision,
} from "@/generated/prisma/enums";

import { ALL_DOMAINS, ALL_PRIORITIES, ALL_CHALLENGE_STATUSES } from "@/lib/constants";
import { enumFromValues, optionalString } from "@/validations/common";

const challengeStatusEnum = enumFromValues(
  ALL_CHALLENGE_STATUSES,
  "status",
);

export const challengeDomainEnum = enumFromValues(
  ALL_DOMAINS,
  "domain",
);

const priorityEnum = enumFromValues(ALL_PRIORITIES, "priority");

export const createChallengeSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(160),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(5000),
  problemStatement: optionalString(5000),
  district: z.string().trim().min(2).max(80),
  block: optionalString(80),
  villageWard: optionalString(80),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  primaryDomain: challengeDomainEnum,
  secondaryDomains: z.array(challengeDomainEnum).max(5).default([]),
  tags: z
    .array(z.string().trim().max(32))
    .max(20)
    .default([]),
  urgency: priorityEnum.default(ChallengePriority.MEDIUM),
  affectedPopulation: optionalString(1000),
  geographicScope: optionalString(300),
  asDraft: z.boolean().optional().default(false),
});

export const updateChallengeSchema = z.object({
  title: z.string().trim().min(5).max(160).optional(),
  description: z.string().trim().min(20).max(5000).optional(),
  problemStatement: optionalString(5000),
  district: z.string().trim().min(2).max(80).optional(),
  block: optionalString(80),
  villageWard: optionalString(80),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  primaryDomain: challengeDomainEnum.optional(),
  secondaryDomains: z.array(challengeDomainEnum).max(5).optional(),
  tags: z.array(z.string().trim().max(32)).max(20).optional(),
  urgency: priorityEnum.optional(),
  affectedPopulation: optionalString(1000),
  geographicScope: optionalString(300),
});

export const reviewChallengeSchema = z.object({
  decision: z.enum([ReviewDecision.APPROVED, ReviewDecision.REJECTED, ReviewDecision.REQUIRES_MORE_INFO]),
  notes: optionalString(2000),
  priority: priorityEnum.optional(),
});

export const transitionChallengeSchema = z.object({
  toStatus: challengeStatusEnum,
  note: optionalString(1000),
});

export const assignChallengeSchema = z.object({
  organizationId: z.string().min(1).max(100),
  notes: optionalString(1000),
});

export const challengeQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(100000).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: challengeStatusEnum.optional(),
  district: z.string().max(80).optional(),
  domain: challengeDomainEnum.optional(),
  priority: priorityEnum.optional(),
  search: z.string().max(200).optional(),
  assignedTo: z.string().max(100).optional(),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;
export type ReviewChallengeInput = z.infer<typeof reviewChallengeSchema>;
export type TransitionChallengeInput = z.infer<typeof transitionChallengeSchema>;
export type AssignChallengeInput = z.infer<typeof assignChallengeSchema>;