// AI abstraction — provider-independent interface.
// The platform must function fully without AI: getAIService() may return null
// and every caller handles that gracefully. AI output is untrusted and is
// validated before use.

import {
  ChallengeDomain,
  ChallengePriority,
} from "@/generated/prisma/enums";

export interface ChallengeClassificationInput {
  title: string;
  description: string;
  tags: string[];
  primaryDomain?: ChallengeDomain | null;
  secondaryDomains?: ChallengeDomain[];
}

export interface ChallengeClassification {
  domain: ChallengeDomain;
  tags: string[];
  confidence: number; // 0..1
  provider: string;
}

export interface DuplicateCandidateSource {
  id: string;
  title: string;
  description: string;
  district: string;
  tags: string[];
}

export interface DuplicateDetectionInput {
  title: string;
  description: string;
  district: string;
  tags: string[];
}

export interface DuplicateCandidate {
  challengeId: string;
  similarity: number; // 0..1
}

export interface DuplicateDetectionResult {
  candidates: DuplicateCandidate[];
  provider: string;
}

export interface ChallengePriorityInput {
  urgency: ChallengePriority;
  affectedPopulation?: string | null;
  geographicScope?: string | null;
  tags: string[];
}

export interface PrioritizationResult {
  priority: ChallengePriority;
  reasons: string[];
  provider: string;
}

export interface RecommendUniversitiesInput {
  primaryDomain: ChallengeDomain;
  secondaryDomains: ChallengeDomain[];
  tags: string[];
  district: string;
}

export interface UniversityRecommendation {
  organizationId: string;
  name: string;
  score: number;
  reasons: string[];
}

export interface UniversityRecommendationResult {
  recommendations: UniversityRecommendation[];
  provider: string;
}

export interface SummarizeInput {
  title: string;
  description: string;
}

export interface SummarizeResult {
  summary: string;
  provider: string;
}

export interface AIService {
  classifyChallenge(
    input: ChallengeClassificationInput,
  ): Promise<ChallengeClassification>;
  detectDuplicates(
    input: DuplicateDetectionInput,
    candidates: DuplicateCandidateSource[],
  ): Promise<DuplicateDetectionResult>;
  prioritizeChallenge(input: ChallengePriorityInput): Promise<PrioritizationResult>;
  recommendUniversities(
    input: RecommendUniversitiesInput,
    candidates: UniversityRecommendation[],
  ): Promise<UniversityRecommendationResult>;
  summarizeChallenge(input: SummarizeInput): Promise<SummarizeResult>;
}