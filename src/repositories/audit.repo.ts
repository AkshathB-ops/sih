import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";

export interface AuditEvent {
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export async function writeAuditLog(event: AuditEvent) {
  return prisma.auditLog.create({
    data: {
      userId: event.userId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      metadata: event.metadata ?? Prisma.JsonNull,
    },
  });
}

export async function listAuditLogs(params?: {
  entityType?: string;
  entityId?: string;
  page?: number;
  pageSize?: number;
}) {
  const where = {
    ...(params?.entityType && { entityType: params.entityType }),
    ...(params?.entityId && { entityId: params.entityId }),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: ((params?.page ?? 1) - 1) * (params?.pageSize ?? 50),
      take: params?.pageSize ?? 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total };
}

export async function deleteExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}