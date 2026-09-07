// Deterministic university matching based on structured capabilities.
// Never hardcodes domain→university mappings. The algorithm is isolated so a
// future AI/semantic matcher can replace it without touching callers.

import { ChallengeDomain } from "@/generated/prisma/enums";

import type {
  RecommendUniversitiesInput,
  UniversityRecommendation,
} from "@/server/ai/ai-service";

export interface CapabilityProfile {
  id: string;
  name: string;
  orgType: string;
  district: string | null;
  disciplines: string[];
  researchAreas: string[];
  labs: string[];
  innovationCentres: string[];
  incubation: boolean;
  techCapabilities: string[];
  facultyExpertise: string[];
  activeAssignments: number;
}

const DOMAIN_MATCH_WEIGHT = 40;
const RESEARCH_MATCH_WEIGHT = 15;
const EXPERTISE_MATCH_WEIGHT = 15;
const CAPABILITY_MATCH_WEIGHT = 15;
const LOCATION_MATCH = 10;
const CAPACITY_BONUS = 5;

function domainWord(domain: ChallengeDomain): string {
  return domain.toLowerCase().replace(/_/g, " ");
}

function scoreDomain(capability: CapabilityProfile, domain: ChallengeDomain): number {
  const word = domainWord(domain);
  const fields = [
    ...capability.disciplines,
    ...capability.researchAreas,
    ...capability.techCapabilities,
  ].map((s) => s.toLowerCase());

  if (fields.some((f) => f === word)) return DOMAIN_MATCH_WEIGHT;
  if (fields.some((f) => f.includes(word) || word.includes(f))) return Math.floor(DOMAIN_MATCH_WEIGHT * 0.7);
  return 0;
}

function tokenizeTags(tags: string[]): string[] {
  return tags.map((t) => t.toLowerCase());
}

export function scoreUniversity(
  capability: CapabilityProfile,
  input: RecommendUniversitiesInput,
): UniversityRecommendation {
  const reasons: string[] = [];
  let score = 0;

  const primary = scoreDomain(capability, input.primaryDomain);
  if (primary > 0) {
    score += primary;
    reasons.push(`Primary domain ${domainWord(input.primaryDomain)} matches institutional profile`);
  } else {
    let secondaryHit = 0;
    for (const d of input.secondaryDomains) {
      secondaryHit = Math.max(secondaryHit, scoreDomain(capability, d));
    }
    if (secondaryHit > 0) {
      score += Math.floor(secondaryHit * 0.7);
      reasons.push("Secondary domain matches institutional profile");
    }
  }

  const expertise = capability.facultyExpertise.map((s) => s.toLowerCase());
  const tagText = tokenizeTags(input.tags);
  const tagHits = tagText.filter((t) => expertise.some((e) => e.includes(t) || t.includes(e)));
  if (tagHits.length > 0) {
    score += EXPERTISE_MATCH_WEIGHT;
    reasons.push(`Faculty expertise overlaps challenge tags: ${tagHits.slice(0, 4).join(", ")}`);
  }

  const researchText = capability.researchAreas.map((s) => s.toLowerCase());
  const researchHits = tagText.filter((t) => researchText.some((r) => r.includes(t)));
  if (researchHits.length > 0) {
    score += RESEARCH_MATCH_WEIGHT;
    reasons.push(`Research areas related to: ${researchHits.slice(0, 3).join(", ")}`);
  }

  const capabilityCount =
    capability.labs.length +
    capability.innovationCentres.length +
    (capability.incubation ? 1 : 0);
  if (capabilityCount > 0) {
    score += CAPABILITY_MATCH_WEIGHT;
    reasons.push(`${capabilityCount} lab/innovation/incubation capabilities available`);
  }

  if (capability.district && capability.district === input.district) {
    score += LOCATION_MATCH;
    reasons.push("Institution is located in the same district");
  }

  if (capability.activeAssignments < 3) {
    score += CAPACITY_BONUS;
    reasons.push("Institution has capacity for new assignments");
  }

  return {
    organizationId: capability.id,
    name: capability.name,
    score,
    reasons,
  };
}

export function rankUniversities(
  capabilities: CapabilityProfile[],
  input: RecommendUniversitiesInput,
): UniversityRecommendation[] {
  return capabilities
    .map((c) => scoreUniversity(c, input))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}