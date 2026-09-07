import { findChallengeById } from "@/repositories/challenge.repo";
import {
  organizationCapabilities,
  type OrganizationCapability,
} from "@/repositories/organization.repo";
import { rankUniversities } from "@/server/matching/matching";

export interface UniversityRanking {
  organization: {
    id: string;
    name: string;
    district: string | null;
    orgType: string;
  };
  score: number;
  reasons: string[];
}

function toRanking(capability: OrganizationCapability, score: number, reasons: string[]): UniversityRanking {
  return {
    organization: {
      id: capability.id,
      name: capability.name,
      district: capability.district,
      orgType: capability.orgType,
    },
    score,
    reasons,
  };
}

// Deterministic university recommendation for a challenge.
// A future AIService-backed recommender can replace the internals.
export async function recommendUniversities(challengeId: string): Promise<UniversityRanking[]> {
  const challenge = await findChallengeById(challengeId);
  const universities = await organizationCapabilities();

  const ranked = rankUniversities(
    universities,
    {
      primaryDomain: challenge.primaryDomain,
      secondaryDomains: challenge.secondaryDomains,
      tags: challenge.tags,
      district: challenge.district,
    },
  );

  const byId = new Map(universities.map((u) => [u.id, u]));

  return ranked
    .map((r) => {
      const capability = byId.get(r.organizationId);
      if (!capability) return null;
      return toRanking(capability, r.score, r.reasons);
    })
    .filter((r): r is UniversityRanking => r !== null);
}