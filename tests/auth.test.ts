import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateSessionToken, hashToken } from "@/lib/auth/session";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("CorrectHorseBatteryStaple");
    expect(hash).not.toContain("CorrectHorseBatteryStaple");
    expect(await verifyPassword("CorrectHorseBatteryStaple", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("CorrectHorseBatteryStaple");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces distinct hashes for the same password (salting)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});

describe("session tokens", () => {
  it("generates opaque random tokens", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{20,}$/);
  });

  it("hashToken is stable and not a plaintext", () => {
    const token = generateSessionToken();
    const digest = hashToken(token);
    expect(digest.length).toBe(64);
    expect(digest).not.toContain(token);
    expect(hashToken(token)).toBe(hashToken(token));
  });
});