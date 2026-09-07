import { z } from "zod";

import { optionalString } from "@/validations/common";

export const createProjectSchema = z.object({
  challengeId: z.string().min(1).max(100),
  title: z.string().trim().min(5).max(160),
  description: optionalString(5000),
  objectives: optionalString(5000),
  methodology: optionalString(5000),
});

export const createCommentSchema = z
  .object({
    content: z.string().trim().min(1).max(2000),
    challengeId: z.string().min(1).max(100).optional(),
    projectId: z.string().min(1).max(100).optional(),
  })
  .refine(
    (v) => Boolean(v.challengeId) !== Boolean(v.projectId),
    { error: "Exactly one of challengeId or projectId is required" },
  );

export const createMilestoneSchema = z.object({
  name: z.string().trim().min(3).max(160),
  description: optionalString(2000),
  dueDate: z.string().datetime().optional(),
});

export const industryInterestSchema = z.object({
  challengeId: z.string().min(1).max(100),
  roles: z.array(z.string().trim().max(40)).max(10).default([]),
  notes: optionalString(1000),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type IndustryInterestInput = z.infer<typeof industryInterestSchema>;