import { describe, expect, it } from "vitest";

import { ChallengeDomain, ChallengePriority } from "@/generated/prisma/enums";
import { calculatePriority } from "@/server/challenges/priority";
import { rankUniversities, scoreUniversity, type CapabilityProfile } from "@/server/matching/matching";

const nit: CapabilityProfile = {
  id: "nit",
  name: "NIT Ranchi",
  orgType: "UNIVERSITY",
  district: "Ranchi",
  disciplines: ["Civil Engineering", "Computer Science", "Water Resource Engineering"],
  researchAreas: ["Water resources", "Disaster management"],
  labs: ["Hydraulics Lab", "GIS Lab"],
  innovationCentres: ["Innovation and Incubation Centre"],
  incubation: true,
  techCapabilities: ["IoT sensors", "Drone surveying", "Remote sensing"],
  facultyExpertise: ["Hydrology", "Flood early warning", "Geoinformatics"],
  activeAssignments: 0,
};

const unrelated: CapabilityProfile = {
  id: "econ",
  name: "A University",
  orgType: "UNIVERSITY",
  district: "Hazaribagh",
  disciplines: ["Commerce", "History"],
  researchAreas: ["Numismatics"],
  labs: [],
  innovationCentres: [],
  incubation: false,
  techCapabilities: [],
  facultyExpertise: ["Accounting"],
  activeAssignments: 5,
};

const input = {
  primaryDomain: ChallengeDomain.WATER_RESOURCES,
  secondaryDomains: [ChallengeDomain.RURAL_LIVELIHOODS],
  tags: ["flood", "water"],
  district: "Ranchi",
};

describe("scoreUniversity", () => {
  it("gives a positive score to a matched institution", () => {
    const result = scoreUniversity(nit, input);
    expect(result.score).toBeGreaterThan(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns zero score for a poor match with no capacity", () => {
    const result = scoreUniversity(unrelated, input);
    expect(result.score).toBe(0);
    expect(result.reasons).toEqual([]);
  });

  it("adds a location match reason for same-district institutions", () => {
    const result = scoreUniversity(nit, input);
    expect(result.reasons.some((r) => r.includes("same district"))).toBe(true);
  });

  it("does not add capacity bonus when assignments exceed capacity", () => {
    const busy = { ...nit, activeAssignments: 4 };
    const result = scoreUniversity(busy, input);
    expect(result.reasons.some((r) => r.includes("capacity for new"))).toBe(false);
  });
});

describe("rankUniversities", () => {
  it("ranks better matches first", () => {
    const ranked = rankUniversities([unrelated, nit], input);
    expect(ranked.length).toBe(1);
    expect(ranked[0].organizationId).toBe("nit");
  });

  it("filters out zero-scored universities", () => {
    const ranked = rankUniversities([unrelated], input);
    expect(ranked).toHaveLength(0);
  });

  it("respects urgency through the advisory path", () => {
    expect(calculatePriority({ urgency: ChallengePriority.CRITICAL, tags: [] })).toBe(ChallengePriority.CRITICAL);
  });
});