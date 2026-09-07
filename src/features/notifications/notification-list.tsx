"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Card, CardBody } from "@/components/ui/card";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export function markAllRead(router: ReturnType<typeof useRouter>): Promise<void> {
  return fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ all: true }),
  }).then(() => router.refresh());
}

export function MarkAllReadButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void markAllRead(router).finally(() => setBusy(false));
      }}
      className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
    >
      {busy ? "Marking…" : "Mark all read"}
    </button>
  );
}

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const router = useRouter();

  async function open(item: NotificationItem) {
    if (!item.readAt) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      }).catch(() => undefined);
      router.refresh();
    }
    if (item.link) router.push(item.link);
  }

  return (
    <div className="mt-6 space-y-2">
      {items.map((n) => {
        const unread = !n.readAt;
        const card = (
          <Card className={`transition-shadow hover:shadow-md ${unread ? "border-teal-200 bg-teal-50/40" : ""}`}>
            <CardBody>
              <div className="flex items-center justify-between gap-3">
                <p className={`font-medium ${unread ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                <span className="shrink-0 text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{n.body}</p>
            </CardBody>
          </Card>
        );
        return n.link ? (
          <button key={n.id} type="button" onClick={() => void open(n)} className="block w-full text-left">
            {card}
          </button>
        ) : (
          <div key={n.id}>{card}</div>
        );
      })}
    </div>
  );
}