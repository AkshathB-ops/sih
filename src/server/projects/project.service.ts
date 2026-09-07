import { MemberRole } from "@/generated/prisma/client";

import { findChallengeById } from "@/repositories/challenge.repo";
import {
  addProjectMember,
  createMilestone,
  createProject,
  findProjectById,
  listProjectsByOrg,
} from "@/repositories/project.repo";
import { findOrganizationIdForUser } from "@/repositories/industry.repo";
import { writeAuditLog } from "@/repositories/audit.repo";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { hasPermission } from "@/lib/auth/rbac";
import type { SessionUser } from "@/types";
import type { CreateProjectInput } from "@/validations/project";

export async function createProjectForUser(
  user: SessionUser,
  input: {
    challengeId: string;
    title: string;
    description?: string | null;
    objectives?: string | null;
    methodology?: string | null;
  },
) {
  if (!hasPermission(user.role, "project:create")) {
    throw new ForbiddenError("You are not permitted to create projects");
  }

  const challenge = await findChallengeById(input.challengeId);
  const assignedToOrg = challenge.assignedOrganizationId;
  if (!assignedToOrg) {
    throw new ConflictError("Challenge is not assigned to any organization");
  }

  if (user.role === "INDUSTRY" || user.role === "STARTUP" || user.role === "MSME" || user.role === "CSR") {
    throw new ForbiddenError("Industry partners cannot create academic projects");
  }

  const userOrg =
    user.role === "UNIVERSITY_ADMIN" || user.role === "FACULTY" || user.role === "STUDENT"
      ? await findOrganizationOfUser(user.id)
      : null;

  if (userOrg && userOrg !== assignedToOrg) {
    throw new ForbiddenError("You can only create projects for challenges assigned to your organization");
  }

  const project = await createProject({
    challengeId: input.challengeId,
    title: input.title,
    description: input.description ?? null,
    objectives: input.objectives ?? null,
    methodology: input.methodology ?? null,
    organizationId: assignedToOrg,
    ownerId: user.id,
  });

  await writeAuditLog({
    userId: user.id,
    action: "project.created",
    entityType: "Project",
    entityId: project.id,
    metadata: { challengeId: input.challengeId },
  });

  return project;
}

export async function getProjectFor(user: SessionUser | null, projectId: string) {
  const project = await findProjectById(projectId);
  const isMember = project.members.some((m) => m.userId === user?.id);
  const canViewAll = user ? hasPermission(user.role, "project:viewAll") : false;
  if (!isMember && !canViewAll) {
    throw new ForbiddenError("You do not have access to this project");
  }
  return project;
}

export async function addMemberToProject(
  user: SessionUser,
  projectId: string,
  input: { userId: string; role: MemberRole; isLead?: boolean },
) {
  const project = await findProjectById(projectId);
  const isLead = project.members.some((m) => m.userId === user.id && m.isLead);
  const canManage = user && (hasPermission(user.role, "project:manage") || isLead);
  if (!canManage) {
    throw new ForbiddenError("Only project leads or administrators can add members");
  }
  const member = await addProjectMember({
    projectId,
    userId: input.userId,
    role: input.role,
    isLead: input.isLead,
  });
  await writeAuditLog({
    userId: user.id,
    action: "project.member_added",
    entityType: "Project",
    entityId: projectId,
    metadata: { memberId: input.userId, role: input.role },
  });
  return member;
}

export async function addMilestoneToProject(
  user: SessionUser,
  projectId: string,
  input: { name: string; description?: string | null; dueDate?: string | null },
) {
  const project = await findProjectById(projectId);
  const isMember = project.members.some((m) => m.userId === user.id);
  if (!isMember) {
    throw new ForbiddenError("Only project members can add milestones");
  }
  const milestone = await createMilestone({
    projectId,
    name: input.name,
    description: input.description ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  });
  await writeAuditLog({
    userId: user.id,
    action: "project.milestone_added",
    entityType: "Project",
    entityId: projectId,
  });
  return milestone;
}

export async function listProjectsForUser(user: SessionUser | null) {
  if (!user) {
    return { items: [], total: 0, page: 1 };
  }

  const orgTypeOf = (role: string) =>
    role === "UNIVERSITY_ADMIN" || role === "FACULTY" || role === "STUDENT"
      ? "UNIVERSITY"
      : role === "INDUSTRY" || role === "STARTUP" || role === "MSME" || role === "CSR"
        ? "INDUSTRY"
        : null;

  const orgType = orgTypeOf(user.role) as "UNIVERSITY" | "INDUSTRY" | null;
  if (!orgType) {
    return { items: [], total: 0, page: 1 };
  }

  const organizationId = await findOrganizationOfUser(user.id);
  if (!organizationId) {
    return { items: [], total: 0, page: 1 };
  }

  return listProjectsByOrg(organizationId, 1, 50);
}

async function findOrganizationOfUser(userId: string): Promise<string | null> {
  try {
    return await findOrganizationIdForUser(userId, ["UNIVERSITY"]);
  } catch {
    return null;
  }
}