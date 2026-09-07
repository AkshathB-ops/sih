import { describe, expect, it } from "vitest";

import { UserRole } from "@/generated/prisma/enums";
import { assertPermission, hasPermission } from "@/lib/auth/rbac";

describe("RBAC permission matrix", () => {
  it("grants citizens challenge creation and submission", () => {
    expect(hasPermission(UserRole.CITIZEN, "challenge:create")).toBe(true);
    expect(hasPermission(UserRole.CITIZEN, "challenge:submitOwn")).toBe(true);
    expect(hasPermission(UserRole.CITIZEN, "challenge:viewOwn")).toBe(true);
  });

  it("never grants citizens admin capabilities", () => {
    expect(hasPermission(UserRole.CITIZEN, "challenge:review")).toBe(false);
    expect(hasPermission(UserRole.CITIZEN, "challenge:assign")).toBe(false);
    expect(hasPermission(UserRole.CITIZEN, "dashboard:gov")).toBe(false);
  });

  it("grants government review/assign/transition and the gov dashboard", () => {
    expect(hasPermission(UserRole.GOVERNMENT, "challenge:review")).toBe(true);
    expect(hasPermission(UserRole.GOVERNMENT, "challenge:assign")).toBe(true);
    expect(hasPermission(UserRole.GOVERNMENT, "challenge:transition")).toBe(true);
    expect(hasPermission(UserRole.GOVERNMENT, "dashboard:gov")).toBe(true);
  });

  it("grants UNIVERSITY_ADMIN project capabilities but not gov assignment", () => {
    expect(hasPermission(UserRole.UNIVERSITY_ADMIN, "project:create")).toBe(true);
    expect(hasPermission(UserRole.UNIVERSITY_ADMIN, "project:manage")).toBe(true);
    expect(hasPermission(UserRole.UNIVERSITY_ADMIN, "challenge:assign")).toBe(false);
    expect(hasPermission(UserRole.UNIVERSITY_ADMIN, "dashboard:university")).toBe(true);
  });

  it("grants industry users interest expression and the industry dashboard", () => {
    expect(hasPermission(UserRole.INDUSTRY, "industry:expressInterest")).toBe(true);
    expect(hasPermission(UserRole.INDUSTRY, "dashboard:industry")).toBe(true);
  });

  it("admins hold every permission", () => {
    const permissions = [
      "challenge:create",
      "challenge:viewAll",
      "challenge:review",
      "challenge:assign",
      "challenge:transition",
      "project:create",
      "project:manage",
      "industry:expressInterest",
      "dashboard:gov",
      "dashboard:university",
      "dashboard:industry",
    ] as const;
    for (const permission of permissions) {
      expect(hasPermission(UserRole.ADMIN, permission)).toBe(true);
    }
  });

  it("throws ForbiddenError via assertPermission for missing permission", () => {
    expect(() => assertPermission(UserRole.CITIZEN, "challenge:assign")).toThrow();
  });
});