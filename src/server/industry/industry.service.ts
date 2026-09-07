import { OrganizationType } from "@/generated/prisma/client";

import {
  createIndustryInterest,
  findOrganizationIdForUser,
  listIndustryCollaborationsByOrg,
} from "@/repositories/industry.repo";
import { writeAuditLog } from "@/repositories/audit.repo";
import { ForbiddenError } from "@/lib/errors";
import { hasPermission } from "@/lib/auth/rbac";
import type { SessionUser } from "@/types";

const ORG_TYPES: OrganizationType[] = [
  OrganizationType.INDUSTRY,
  OrganizationType.STARTUP,
  OrganizationType.MSME,
  OrganizationType.CSR,
];

export async function expressIndustryInterest(
  user: SessionUser,
  input: { challengeId: string; roles: string[]; notes?: string | null },
) {
  if (!hasPermission(user.role, "industry:expressInterest")) {
    throw new ForbiddenError("You are not permitted to express industry interest");
  }

  const organizationId = await findOrganizationIdForUser(user.id, ORG_TYPES);

  const collaboration = await createIndustryInterest({
    organizationId,
    challengeId: input.challengeId,
    roles: input.roles,
    notes: input.notes,
  });

  await writeAuditLog({
    userId: user.id,
    action: "industry.interest",
    entityType: "IndustryCollaboration",
    entityId: collaboration.id,
    metadata: { challengeId: input.challengeId },
  });

  return collaboration;
}

export async function listInterestForUser(user: SessionUser) {
  const organizationId = await findOrganizationIdForUser(user.id, ORG_TYPES);
  return listIndustryCollaborationsByOrg(organizationId);
}