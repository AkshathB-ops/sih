import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ALL_CHALLENGE_STATUSES,
  ALL_DOMAINS,
  ALL_PRIORITIES,
  CHALLENGE_DOMAIN_LABELS,
  CHALLENGE_STATUS_LABELS,
} from "@/lib/constants";
import { getCurrentUser } from "@/server/auth/session.service";
import { hasPermission } from "@/lib/auth/rbac";
import { listChallengesFor } from "@/server/challenges/challenge.service";
import { getGovernmentDashboard } from "@/server/analytics/analytics.service";
import { Header } from "@/components/layout/header";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

const QUEUE = ["SUBMITTED", "UNDER_REVIEW", "VALIDATION_REQUIRED"];

function parseFlag<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; domain?: string; priority?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "dashboard:gov")) redirect("/");

  const params = await searchParams;
  const status = parseFlag(params.status, ALL_CHALLENGE_STATUSES);
  const domain = parseFlag(params.domain, ALL_DOMAINS);
  const priority = parseFlag(params.priority, ALL_PRIORITIES);
  const page = Math.max(1, Number(params.page) || 1);

  const [overview, queue] = await Promise.all([
    getGovernmentDashboard(user),
    listChallengesFor(user, {
      page,
      pageSize: 25,
      status,
      domain,
      priority,
    }),
  ]);

  const isQueueView = status ? QUEUE.includes(status) : true;

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Government operations</h1>
            <p className="mt-0.5 text-sm text-gray-500">Live numbers come straight from the database.</p>
          </div>
          <Link href="/challenges" className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            Browse
          </Link>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Submitted" value={overview.funnel.submitted} />
          <Metric label="Under review" value={overview.funnel.underReview} />
          <Metric label="Validated" value={overview.funnel.validated} />
          <Metric label="Assigned" value={overview.funnel.assigned} />
          <Metric label="Active" value={overview.funnel.active} />
          <Metric label="Resolved" value={overview.funnel.resolved} />
          <Metric label="Projects" value={overview.projects} />
          <Metric label="Universities" value={overview.participants.universities} />
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Review queue</h2>
          <form method="get" action="/admin/dashboard" className="mt-3 flex flex-wrap gap-2">
            <select name="status" defaultValue={status ?? ""} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="">{isQueueView ? "Queue statuses" : "All statuses"}</option>
              {ALL_CHALLENGE_STATUSES.map((s) => (
                <option key={s} value={s}>{CHALLENGE_STATUS_LABELS[s] ?? s}</option>
              ))}
            </select>
            <select name="domain" defaultValue={domain ?? ""} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="">All domains</option>
              {ALL_DOMAINS.map((d) => (
                <option key={d} value={d}>{CHALLENGE_DOMAIN_LABELS[d]}</option>
              ))}
            </select>
            <select name="priority" defaultValue={priority ?? ""} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="">All priorities</option>
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              Filter
            </button>
          </form>

          {queue.items.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Nothing in the queue" description="Adjust filters or wait for new citizen reports." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {queue.items.map((c) => (
                <Link key={c.id} href={`/challenges/${c.id}`} className="block">
                  <Card className="transition-shadow hover:shadow-md">
                    <CardBody className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">
                          {CHALLENGE_DOMAIN_LABELS[c.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS]} · {c.district} · {c.createdAt.toLocaleDateString()}
                        </div>
                        <p className="mt-0.5 font-medium text-gray-900 line-clamp-1">{c.title}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <PriorityBadge priority={c.priority as never} />
                        <StatusBadge status={c.status as never} />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      </CardBody>
    </Card>
  );
}