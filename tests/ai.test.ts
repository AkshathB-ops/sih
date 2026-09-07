import { describe, expect, it } from "vitest";

import { ChallengeDomain, ChallengePriority } from "@/generated/prisma/enums";
import { DeterministicAIService, DETERMINISTIC_PROVIDER } from "@/server/ai/deterministic-ai";
import { getAIService, resolveAIService } from "@/server/ai";

describe("DeterministicAIService", () => {
  const ai = new DeterministicAIService();

  it("classifies a water challenge", async () => {
    const result = await ai.classifyChallenge({
      title: "Drinking water scarcity in a drought-prone block",
      description: "Villages depend on handpumps that fail every summer.",
      tags: ["drinking water", "handpump"],
    });
    expect(result.provider).toBe(DETERMINISTIC_PROVIDER);
    expect(result.domain).toBe(ChallengeDomain.WATER_RESOURCES);
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  it("falls back to primary domain when nothing matches", async () => {
    const result = await ai.classifyChallenge({
      title: "Something nondescript for a test fixture",
      description: "Qux blorpt zotz flim.",
      tags: [],
      primaryDomain: ChallengeDomain.OTHER,
    });
    expect(result.domain).toBe(ChallengeDomain.OTHER);
  });

  it("detects duplicates by token overlap", async () => {
    const result = await ai.detectDuplicates(
      {
        title: "Flooding cuts off villages in Koderma",
        description: "Monsoon flood water cuts roads for weeks.",
        district: "Koderma",
        tags: ["flood"],
      },
      [
        {
          id: "c1",
          title: "Flooding cuts off villages in Koderma",
          description: "Monsoon flood water cuts roads for weeks.",
          district: "Koderma",
          tags: ["flood"],
        },
        {
          id: "c2",
          title: "Library digitization drive",
          description: "Digitize records in school libraries.",
          district: "Ranchi",
          tags: ["library"],
        },
      ],
    );
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].challengeId).toBe("c1");
  });

  it("prioritizes using the heuristic", async () => {
    const result = await ai.prioritizeChallenge({
      urgency: ChallengePriority.MEDIUM,
      affectedPopulation: "around 10,000 residents",
      tags: ["flood"],
    });
    expect(result.provider).toBe(DETERMINISTIC_PROVIDER);
    expect(result.priority).toBe(ChallengePriority.HIGH);
  });

  it("summarizes long descriptions", async () => {
    const result = await ai.summarizeChallenge({
      title: "Long title",
      description: "word ".repeat(300),
    });
    expect(result.summary.length).toBeLessThan(200);
  });
});

describe("AI provider factory", () => {
  it("returns null when the provider is 'none'", () => {
    expect(resolveAIService("none")).toBeNull();
  });

  it("returns the deterministic heuristic for the deterministic provider", () => {
    const svc = resolveAIService("deterministic");
    expect(svc).not.toBeNull();
    expect(svc).toBeInstanceOf(DeterministicAIService);
  });

  it("getAIService yields a working service in the default configuration", async () => {
    const svc = getAIService();
    if (svc === null) return; // only when AI_PROVIDER=none is configured locally
    const result = await svc.prioritizeChallenge({
      urgency: ChallengePriority.MEDIUM,
      tags: [],
    });
    expect(result.provider).toBe(DETERMINISTIC_PROVIDER);
  });
});