import { z } from "zod";

import { handle, ok, parse } from "@/lib/api/response";
import { requirePermission } from "@/server/auth/session.service";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadCount,
} from "@/repositories/notification.repo";

const markReadSchema = z
  .object({
    all: z.boolean().optional(),
    id: z.string().max(100).optional(),
  })
  .refine((v) => Boolean(v.all || v.id), {
    message: "Provide an id or all=true",
  });

export const GET = handle(async (request: Request) => {
  const user = await requirePermission("notifications:viewOwn");
  const search = new URL(request.url).searchParams;
  const page = Math.max(1, Number(search.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(search.get("pageSize")) || 20));

  const [notifications, unread] = await Promise.all([
    listNotifications(user, page, pageSize),
    unreadCount(user.id),
  ]);

  return ok({ notifications, unread });
});

export const PATCH = handle(async (request: Request) => {
  const user = await requirePermission("notifications:viewOwn");
  const body = parse(markReadSchema, await request.json().catch(() => null));

  if (body.all) {
    await markAllNotificationsRead(user.id);
  } else if (body.id) {
    await markNotificationRead(user.id, body.id);
  }

  return ok({ ok: true });
});