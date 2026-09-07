import { describe, expect, it } from "vitest";

import { createChallengeSchema, reviewChallengeSchema } from "@/validations/challenge";
import { loginSchema, registerSchema } from "@/validations/auth";

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Ramesh Mahto",
      email: "ramesh@example.com",
      password: "SecurePass1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a weak password", () => {
    const result = registerSchema.safeParse({
      name: "Ramesh",
      email: "ramesh@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = registerSchema.safeParse({
      name: "Ramesh",
      email: "not-an-email",
      password: "SecurePass1!",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts email/password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x".repeat(8) }).success).toBe(true);
  });
});

describe("createChallengeSchema", () => {
  const valid = {
    title: "Erratic water supply in Harmu slum",
    description: "Residents receive tanker water only a few hours a week and borewells dry up in summer.",
    district: "Ranchi",
    primaryDomain: "WATER_RESOURCES",
    urgency: "HIGH",
  };

  it("accepts a complete challenge", () => {
    expect(createChallengeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a too-short title", () => {
    expect(createChallengeSchema.safeParse({ ...valid, title: "Hi" }).success).toBe(false);
  });

  it("rejects an unknown domain", () => {
    expect(createChallengeSchema.safeParse({ ...valid, primaryDomain: "SPORTS" }).success).toBe(false);
  });

  it("rejects a malformed latitude", () => {
    expect(createChallengeSchema.safeParse({ ...valid, latitude: 200 }).success).toBe(false);
  });

  it("coerces missing optional fields to defaults", () => {
    const result = createChallengeSchema.parse(valid);
    expect(result.secondaryDomains).toEqual([]);
    expect(result.tags).toEqual([]);
    expect(result.asDraft).toBe(false);
  });
});

describe("reviewChallengeSchema", () => {
  it("accepts valid decisions", () => {
    expect(reviewChallengeSchema.safeParse({ decision: "APPROVED" }).success).toBe(true);
    expect(reviewChallengeSchema.safeParse({ decision: "REJECTED", notes: "n" }).success).toBe(true);
  });

  it("rejects unknown decisions", () => {
    expect(reviewChallengeSchema.safeParse({ decision: "MAYBE" }).success).toBe(false);
  });
});