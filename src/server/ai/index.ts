import { env } from "@/lib/config/env";

import type { AIService } from "@/server/ai/ai-service";
import { DeterministicAIService } from "@/server/ai/deterministic-ai";

export type AIServiceProvider = "none" | "deterministic";

// Exposed for tests. Provider selection is isolated so callers only depend on
// the AIService interface, never on SDKs or provider details.
export function resolveAIService(provider: AIServiceProvider): AIService | null {
  if (provider === "none") return null;
  return new DeterministicAIService();
}

// Returns null when AI is disabled so callers degrade gracefully — the
// platform never depends on AI.
export function getAIService(): AIService | null {
  return resolveAIService(env.aiProvider);
}

export { DETERMINISTIC_PROVIDER } from "@/server/ai/deterministic-ai";
export type {
  AIService,
  ChallengeClassification,
  ChallengeClassificationInput,
  DuplicateCandidateSource,
  DuplicateDetectionInput,
  DuplicateDetectionResult,
  PrioritizationResult,
  RecommendUniversitiesInput,
  SummarizeInput,
  SummarizeResult,
  UniversityRecommendation,
  UniversityRecommendationResult,
} from "@/server/ai/ai-service";