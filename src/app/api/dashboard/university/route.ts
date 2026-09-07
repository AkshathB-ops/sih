import { handle, ok } from "@/lib/api/response";
import { requirePermission } from "@/server/auth/session.service";
import { findOrganizationIdForUser } from "@/repositories/industry.repo";
import { getUniversityDashboard } from "@/server/analytics/analytics.service";
import { OrganizationType } from "@/generated/prisma/client";

export const GET = handle(async () => {
  const user = await requirePermission("dashboard:university");
  const organizationId = await findOrganizationIdForUser(user.id, [OrganizationType.UNIVERSITY]);
  const overview = await getUniversityDashboard(user, organizationId);
  return ok({ overview, organizationId });
});