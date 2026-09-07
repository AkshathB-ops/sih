import { OrganizationType, type Organization } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";

export async function listOrganizations(params?: {
  orgType?: OrganizationType;
  district?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const where = {
    ...(params?.orgType && { orgType: params.orgType }),
    ...(params?.district && { district: params.district }),
    ...(params?.search && { name: { contains: params.search, mode: "insensitive" as const } }),
  };

  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy: { name: "asc" },
      skip: ((params?.page ?? 1) - 1) * (params?.pageSize ?? 20),
      take: params?.pageSize ?? 20,
    }),
    prisma.organization.count({ where }),
  ]);

  return { items, total };
}

export async function findOrganizationById(id: string) {
  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      departments: true,
      faculty: { include: { user: { select: { id: true, name: true } } } },
      students: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!org) throw new NotFoundError("Organization not found");
  return org;
}

export interface OrganizationCapability {
  id: string;
  name: string;
  orgType: OrganizationType;
  district: string | null;
  disciplines: string[];
  researchAreas: string[];
  labs: string[];
  innovationCentres: string[];
  incubation: boolean;
  techCapabilities: string[];
  facultyExpertise: string[];
  activeAssignments: number;
}

export async function organizationCapabilities(): Promise<OrganizationCapability[]> {
  const orgs = await prisma.organization.findMany({
    where: { orgType: OrganizationType.UNIVERSITY },
    select: {
      id: true,
      name: true,
      orgType: true,
      district: true,
      disciplines: true,
      researchAreas: true,
      labs: true,
      innovationCentres: true,
      incubation: true,
      techCapabilities: true,
      faculty: { select: { expertise: true } },
      challengeAssignments: {
        select: { status: true },
      },
    },
  });

  return orgs.map((org) => ({
    id: org.id,
    name: org.name,
    orgType: org.orgType,
    district: org.district,
    disciplines: org.disciplines,
    researchAreas: org.researchAreas,
    labs: org.labs,
    innovationCentres: org.innovationCentres,
    incubation: org.incubation,
    techCapabilities: org.techCapabilities,
    facultyExpertise: org.faculty.flatMap((f) => f.expertise),
    activeAssignments: org.challengeAssignments.filter((a) => a.status === "PENDING").length,
  }));
}