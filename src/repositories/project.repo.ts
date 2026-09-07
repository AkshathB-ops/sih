import { ChallengeStatus, MemberRole } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors";

export interface CreateProjectInput {
  challengeId: string;
  title: string;
  description?: string | null;
  organizationId: string;
  ownerId: string;
  objectives?: string | null;
  methodology?: string | null;
}

export async function createProject(input: CreateProjectInput) {
  return prisma.$transaction(async (tx) => {
    const challenge = await tx.challenge.findUnique({
      where: { id: input.challengeId },
    });
    if (!challenge) throw new NotFoundError("Challenge not found");
    if (challenge.status !== ChallengeStatus.ACCEPTED) {
      throw new ConflictError(
        `Cannot create a project until the challenge is ACCEPTED (current: ${challenge.status})`,
      );
    }

    const project = await tx.project.create({
      data: {
        challengeId: input.challengeId,
        title: input.title,
        description: input.description ?? null,
        organizationId: input.organizationId,
        ownerId: input.ownerId,
        objectives: input.objectives ?? null,
        methodology: input.methodology ?? null,
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: input.ownerId,
        role: MemberRole.FACULTY,
        isLead: true,
      },
    });

    await tx.milestone.create({
      data: {
        projectId: project.id,
        name: "Kickoff",
        description: "Project initiation and planning",
      },
    });

    await tx.challenge.update({
      where: { id: input.challengeId },
      data: { status: ChallengeStatus.IN_PROGRESS },
    });

    return project;
  });
}

export async function findProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          status: true,
          district: true,
          primaryDomain: true,
        },
      },
      organization: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, role: true } } } },
      milestones: { include: { deliverables: true }, orderBy: { createdAt: "asc" } },
      collaborations: { include: { organization: { select: { id: true, name: true } } } },
      impactMetrics: true,
      documents: true,
    },
  });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}

export async function addProjectMember(params: {
  projectId: string;
  userId: string;
  role: MemberRole;
  isLead?: boolean;
}) {
  return prisma.projectMember.upsert({
    where: {
      projectId_userId: { projectId: params.projectId, userId: params.userId },
    },
    update: { role: params.role, isLead: params.isLead ?? false },
    create: {
      projectId: params.projectId,
      userId: params.userId,
      role: params.role,
      isLead: params.isLead ?? false,
    },
  });
}

export async function createMilestone(params: {
  projectId: string;
  name: string;
  description?: string | null;
  dueDate?: Date | null;
}) {
  return prisma.milestone.create({
    data: {
      projectId: params.projectId,
      name: params.name,
      description: params.description ?? null,
      dueDate: params.dueDate ?? null,
    },
  });
}

export async function listProjectsByOrg(
  organizationId: string,
  page = 1,
  pageSize = 20,
) {
  const where = { organizationId };
  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        challenge: { select: { id: true, title: true, primaryDomain: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);
  return { items, total, page };
}