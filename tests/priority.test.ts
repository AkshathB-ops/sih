import { describe, expect, it } from "vitest";

import { ChallengePriority } from "@/generated/prisma/enums";
import { calculatePriority } from "@/server/challenges/priority";

describe("calculatePriority", () => {
  it("passes through CRITICAL and HIGH urgency", () => {
    expect(calculatePriority({ urgency: ChallengePriority.CRITICAL, tags: [] })).toBe(ChallengePriority.CRITICAL);
    expect(calculatePriority({ urgency: ChallengePriority.HIGH, tags: [] })).toBe(ChallengePriority.HIGH);
    expect(calculatePriority({ urgency: ChallengePriority.LOW, tags: [] })).toBe(ChallengePriority.LOW);
  });

  it("bumps MEDIUM to HIGH for large affected populations", () => {
    expect(
      calculatePriority({
        urgency: ChallengePriority.MEDIUM,
        affectedPopulation: "around 10,000 residents",
        tags: [],
      }),
    ).toBe(ChallengePriority.HIGH);
  });

  it("bumps MEDIUM to HIGH for wide scope", () => {
    expect(
      calculatePriority({
        urgency: ChallengePriority.MEDIUM,
        geographicScope: "multiple blocks across the district",
        tags: [],
      }),
    ).toBe(ChallengePriority.HIGH);
  });

  it("bumps MEDIUM to HIGH for safety-critical tags", () => {
    expect(
      calculatePriority({
        urgency: ChallengePriority.MEDIUM,
        tags: ["flood", "safety"],
      }),
    ).toBe(ChallengePriority.HIGH);
  });

  it("keeps plain MEDIUM challenges at MEDIUM", () => {
    expect(
      calculatePriority({
        urgency: ChallengePriority.MEDIUM,
        affectedPopulation: "a small hamlet",
        tags: ["library"],
      }),
    ).toBe(ChallengePriority.MEDIUM);
  });
});