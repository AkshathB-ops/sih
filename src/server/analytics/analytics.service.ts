import type { SessionUser } from "@/types";
import { hasPermission } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/errors";
import {
  governmentOverview,
  industryOverview,
  universityOverview,
} from "@/repositories/analytics.repo";

export async function getGovernmentDashboard(user: SessionUser) {
  if (!hasPermission(user.role, "dashboard:gov")) {
    throw new ForbiddenError("You are not permitted to view this dashboard");
  }
  return governmentOverview();
}

export async function getUniversityDashboard(
  user: SessionUser,
  organizationId: string,
) {
  if (!hasPermission(user.role, "dashboard:university")) {
    throw new ForbiddenError("You are not permitted to view this dashboard");
  }
  return universityOverview(organizationId);
}

export async function getIndustryDashboard(
  user: SessionUser,
  organizationId: string,
) {
  if (!hasPermission(user.role, "dashboard:industry")) {
    throw new ForbiddenError("You are not permitted to view this dashboard");
  }
  return industryOverview(organizationId);
}