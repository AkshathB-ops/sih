import { NotificationType, type Notification } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import type { SessionUser } from "@/types";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
    },
  });
}

export async function listNotifications(
  user: SessionUser,
  page = 1,
  pageSize = 20,
) {
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return { items, total, unread, page };
}

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<Notification> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) throw new NotFoundError("Notification not found");
  if (notification.readAt) return notification;
  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}