import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/session.service";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/states";
import { listNotifications } from "@/repositories/notification.repo";
import { MarkAllReadButton, NotificationList } from "@/features/notifications/notification-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { items, unread } = await listNotifications(user, 1, 50);

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
            <p className="mt-0.5 text-sm text-gray-500">{unread > 0 ? `${unread} unread` : "You are all caught up"}</p>
          </div>
          {unread > 0 ? <MarkAllReadButton /> : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No notifications" description="Status updates about your challenges will appear here." />
          </div>
        ) : (
          <NotificationList
            items={items.map((n) => ({
              id: n.id,
              title: n.title,
              body: n.body,
              link: n.link,
              readAt: n.readAt?.toISOString() ?? null,
              createdAt: n.createdAt.toISOString(),
            }))}
          />
        )}
      </main>
    </>
  );
}