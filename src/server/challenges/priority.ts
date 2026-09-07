// Deterministic priority calculation (Phase 1).
// This is a heuristic, not AI. It is isolated behind a service so a future
// AI-driven prioritizer can replace it without touching the domain layer.

import { ChallengePriority } from "@/generated/prisma/enums";

import type { ChallengePriorityInput } from "@/server/ai/ai-service";

const LARGE_POPULATION =
  /\b(10[,.]?000|lakh|10000\+|5000\+|ten thousand|majority|entire)\b/i;
const WIDE_SCOPE = /(multiple|several|many|district(?:-| )wide|entire district)\b/i;

export function calculatePriority(
  input: ChallengePriorityInput,
): ChallengePriority {
  switch (input.urgency) {
    case ChallengePriority.CRITICAL:
      return ChallengePriority.CRITICAL;
    case ChallengePriority.HIGH:
      return ChallengePriority.HIGH;
    case ChallengePriority.LOW:
      return ChallengePriority.LOW;
    case ChallengePriority.MEDIUM:
    default:
      break;
  }

  const populationText = `${input.affectedPopulation ?? ""} ${input.geographicScope ?? ""}`;
  let bumped = false;
  if (LARGE_POPULATION.test(populationText)) bumped = true;
  if (WIDE_SCOPE.test(populationText)) bumped = true;
  if (input.tags.some((t) => /water|health|safety|disaster/i.test(t))) bumped = true;

  return bumped ? ChallengePriority.HIGH : ChallengePriority.MEDIUM;
}