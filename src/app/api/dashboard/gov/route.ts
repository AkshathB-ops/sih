import { handle, ok } from "@/lib/api/response";
import { requirePermission } from "@/server/auth/session.service";
import { getGovernmentDashboard } from "@/server/analytics/analytics.service";

export const GET = handle(async () => {
  const user = await requirePermission("dashboard:gov");
  const overview = await getGovernmentDashboard(user);
  return ok({ overview });
});