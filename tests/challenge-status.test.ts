import { describe, expect, it } from "vitest";

import { ChallengeStatus, UserRole } from "@/generated/prisma/enums";
import {
  allowedNextStatuses,
  assertTransition,
  isAllowedTransition,
} from "@/server/challenges/challenge-status";

describe("challenge status machine", () => {
  it("lets a citizen submit a draft", () => {
    expect(
      isAllowedTransition(UserRole.CITIZEN, ChallengeStatus.DRAFT, ChallengeStatus.SUBMITTED),
    ).toBe(true);
  });

  it("lets government/admin review straight from SUBMITTED", () => {
    expect(
      isAllowedTransition(UserRole.GOVERNMENT, ChallengeStatus.SUBMITTED, ChallengeStatus.VALIDATED),
    ).toBe(true);
    expect(
      isAllowedTransition(UserRole.GOVERNMENT, ChallengeStatus.SUBMITTED, ChallengeStatus.REJECTED),
    ).toBe(true);
    expect(
      isAllowedTransition(UserRole.GOVERNMENT, ChallengeStatus.SUBMITTED, ChallengeStatus.VALIDATION_REQUIRED),
    ).toBe(true);
  });

  it("does not let a university admin validate submissions", () => {
    expect(
      isAllowedTransition(UserRole.UNIVERSITY_ADMIN, ChallengeStatus.SUBMITTED, ChallengeStatus.VALIDATED),
    ).toBe(false);
  });

  it("lets government move a validated challenge through matching to assigned", () => {
    expect(isAllowedTransition(UserRole.GOVERNMENT, ChallengeStatus.VALIDATED, ChallengeStatus.MATCHING)).toBe(true);
    expect(isAllowedTransition(UserRole.GOVERNMENT, ChallengeStatus.MATCHING, ChallengeStatus.ASSIGNED)).toBe(true);
  });

  it("lets a university admin accept an assigned challenge", () => {
    expect(isAllowedTransition(UserRole.UNIVERSITY_ADMIN, ChallengeStatus.ASSIGNED, ChallengeStatus.ACCEPTED)).toBe(true);
  });

  it("lets a faculty member push an accepted project to pilot", () => {
    expect(isAllowedTransition(UserRole.FACULTY, ChallengeStatus.IN_PROGRESS, ChallengeStatus.PILOT)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(isAllowedTransition(UserRole.CITIZEN, ChallengeStatus.SUBMITTED, ChallengeStatus.VALIDATED)).toBe(false);
    expect(isAllowedTransition(UserRole.GOVERNMENT, ChallengeStatus.ASSIGNED, ChallengeStatus.SUBMITTED)).toBe(false);
    expect(isAllowedTransition(UserRole.STUDENT, ChallengeStatus.SUBMITTED, ChallengeStatus.VALIDATED)).toBe(false);
  });

  it("rejects transitions from a terminal status", () => {
    expect(isAllowedTransition(UserRole.ADMIN, ChallengeStatus.REJECTED, ChallengeStatus.VALIDATED)).toBe(false);
    expect(isAllowedTransition(UserRole.ADMIN, ChallengeStatus.ARCHIVED, ChallengeStatus.RESOLVED)).toBe(false);
  });

  it("assertTransition throws for a forbidden role", () => {
    expect(() =>
      assertTransition(UserRole.STUDENT, ChallengeStatus.SUBMITTED, ChallengeStatus.UNDER_REVIEW),
    ).toThrow();
  });

  it("allowedNextStatuses returns only role-permitted targets", () => {
    const citizenFromDraft = allowedNextStatuses(UserRole.CITIZEN, ChallengeStatus.DRAFT);
    expect(citizenFromDraft).toEqual([ChallengeStatus.SUBMITTED]);

    const govFromSubmitted = allowedNextStatuses(UserRole.GOVERNMENT, ChallengeStatus.SUBMITTED);
    expect(govFromSubmitted).toContain(ChallengeStatus.VALIDATED);
    expect(govFromSubmitted).toContain(ChallengeStatus.REJECTED);
    expect(govFromSubmitted).toContain(ChallengeStatus.UNDER_REVIEW);
    expect(govFromSubmitted).toContain(ChallengeStatus.VALIDATION_REQUIRED);

    const studentFromDraft = allowedNextStatuses(UserRole.STUDENT, ChallengeStatus.DRAFT);
    expect(studentFromDraft).toEqual([]);
  });
});