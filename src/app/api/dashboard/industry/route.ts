import { handle, ok } from "@/lib/api/response";
import { requirePermission } from "@/server/auth/session.service";
import { findOrganizationIdForUser } from "@/repositories/industry.repo";
import { getIndustryDashboard } from "@/server/analytics/analytics.service";
import { OrganizationType } from "@/generated/prisma/client";

const INDUSTRY_TYPES: OrganizationType[] = [
  OrganizationType.INDUSTRY,
  OrganizationType.STARTUP,
  OrganizationType.MSME,
  OrganizationType.CSR,
];

export const GET = handle(async () => {
  const user = await requirePermission("dashboard:industry");
  const organizationId = await findOrganizationIdForUser(user.id, INDUSTRY_TYPES);
  const overview = await getIndustryDashboard(user, organizationId);
  return ok({ overview, organizationId });
});