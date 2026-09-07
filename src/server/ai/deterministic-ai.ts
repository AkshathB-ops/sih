// Deterministic heuristic provider behind the AIService interface.
// Explicitly NOT an LLM. This is rule-based classification/prioritization used
// so the application works without any external AI. It is clearly labeled
// in the UI and in provider metadata so it is never mistaken for real AI.

import { ChallengeDomain } from "@/generated/prisma/enums";

import type {
  AIService,
  ChallengeClassification,
  ChallengeClassificationInput,
  ChallengePriorityInput,
  DuplicateCandidate,
  DuplicateCandidateSource,
  DuplicateDetectionInput,
  DuplicateDetectionResult,
  PrioritizationResult,
  RecommendUniversitiesInput,
  SummarizeInput,
  SummarizeResult,
  UniversityRecommendationResult,
} from "@/server/ai/ai-service";
import { calculatePriority } from "@/server/challenges/priority";

export const DETERMINISTIC_PROVIDER = "deterministic-heuristic";

const DOMAIN_KEYWORDS: Array<[string, ChallengeDomain]> = [
  ["school|education|teacher|student|literacy|skill.", ChallengeDomain.EDUCATION],
  ["health|hospital|clinic|doctor|disease|sanitization|vaccine|medicine|nutrition", ChallengeDomain.HEALTHCARE],
  ["farm|agriculture|crop|farmer|irrigation|livestock|seed|soil|paddy|harvest", ChallengeDomain.AGRICULTURE],
  ["water|drinking water|pond|well|groundwater|river|waterlogging|drinking", ChallengeDomain.WATER_RESOURCES],
  ["toilet|sanitation|open defecation|waste management|sewage|garbage|solid waste", ChallengeDomain.SANITATION],
  ["pollution|forest|tree|wildlife|climate|waste|recycl|environment", ChallengeDomain.ENVIRONMENT],
  ["electricity|power|solar|energy|grid|renewable|battery|biogas", ChallengeDomain.ENERGY],
  ["road|street|traffic|urban|housing|slum|infrastructure|footpath", ChallengeDomain.URBAN_DEVELOPMENT],
  ["disability|wheelchair|accessible|blind|deaf|accessibility", ChallengeDomain.ACCESSIBILITY],
  ["government scheme|certificate|ration|pension|administration|public service|bureaucrac", ChallengeDomain.PUBLIC_ADMINISTRATION],
  ["livelihood|employment|job|income|self-help|handicraft|artisan|skill development", ChallengeDomain.RURAL_LIVELIHOODS],
  ["transport|bus|train|road|mobility|commute|connectivity", ChallengeDomain.TRANSPORTATION],
  ["digital|internet|mobile app|online|connectivity|e-governance|broadband", ChallengeDomain.DIGITAL_SERVICES],
  ["flood|disaster|earthquake|cyclone|landslide|relief|evacuat", ChallengeDomain.DISASTER_MANAGEMENT],
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function classifyDomain(input: ChallengeClassificationInput): {
  domain: ChallengeDomain;
  confidence: number;
  tags: string[];
} {
  const text = normalize(`${input.title} ${input.description} ${input.tags.join(" ")}`);
  const matched: Array<{ domain: ChallengeDomain; hits: number }> = [];

  for (const [pattern, domain] of DOMAIN_KEYWORDS) {
    const rx = new RegExp(pattern, "gi");
    const hits = (text.match(rx) ?? []).length;
    if (hits > 0) matched.push({ domain, hits });
  }

  if (matched.length === 0) {
    return {
      domain: input.primaryDomain ?? ChallengeDomain.OTHER,
      confidence: 0.1,
      tags: input.tags,
    };
  }

  matched.sort((a, b) => b.hits - a.hits);
  const top = matched[0];
  const total = matched.reduce((s, m) => s + m.hits, 0);
  const confidence = Math.min(0.95, 0.4 + top.hits / Math.max(1, total));

  // Suggest complementary domains for the matched clusters.
  const suggestedTags = matched
    .filter((m) => m.hits > 0)
    .slice(0, 3)
    .map((m) => m.domain.toLowerCase());

  return { domain: top.domain, confidence, tags: [...new Set([...input.tags, ...suggestedTags])] };
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const union = new Set([...a, ...b]);
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  return inter / union.size;
}

export class DeterministicAIService implements AIService {
  async classifyChallenge(
    input: ChallengeClassificationInput,
  ): Promise<ChallengeClassification> {
    const { domain, confidence, tags } = classifyDomain(input);
    return { domain, tags, confidence, provider: DETERMINISTIC_PROVIDER };
  }

  async detectDuplicates(
    input: DuplicateDetectionInput,
    candidates: DuplicateCandidateSource[],
  ): Promise<DuplicateDetectionResult> {
    const tokens = new Set(normalize(`${input.title} ${input.description} ${input.tags.join(" ")}`).split(/\s+/).filter((t) => t.length > 3));
    const results: DuplicateCandidate[] = [];

    for (const c of candidates) {
      const cTokens = new Set(normalize(`${c.title} ${c.description} ${c.tags.join(" ")}`).split(/\s+/).filter((t) => t.length > 3));
      const sim = jaccard(tokens, cTokens);
      if (sim >= 0.3) {
        results.push({ challengeId: c.id, similarity: Math.round(sim * 100) / 100 });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return { candidates: results.slice(0, 5), provider: DETERMINISTIC_PROVIDER };
  }

  async prioritizeChallenge(
    input: ChallengePriorityInput,
  ): Promise<PrioritizationResult> {
    const priority = calculatePriority(input);
    const reasons =
      priority === input.urgency
        ? [`Retained initial urgency of ${input.urgency.toLowerCase()}`]
        : [
            `Raised from ${input.urgency.toLowerCase()} to ${priority.toLowerCase()} based on affected population / scope / tags`,
          ];
    return { priority, reasons, provider: DETERMINISTIC_PROVIDER };
  }

  async recommendUniversities(
    input: RecommendUniversitiesInput,
    candidates: UniversityRecommendationResult["recommendations"],
  ): Promise<UniversityRecommendationResult> {
    // Delegates scoring to the same deterministic matching engine so AI and
    // non-AI recommendations never diverge in Phase 1.
    return {
      recommendations: candidates,
      provider: DETERMINISTIC_PROVIDER,
    };
  }

  async summarizeChallenge(input: SummarizeInput): Promise<SummarizeResult> {
    const cleaned = input.description.replace(/\s+/g, " ").trim();
    const summary = cleaned.length > 180
      ? `${cleaned.slice(0, 180).trimEnd()}…`
      : cleaned;
    return { summary, provider: DETERMINISTIC_PROVIDER };
  }
}