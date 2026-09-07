import Link from "next/link";
import type { ChallengeDomain, ChallengePriority, ChallengeStatus } from "@/generated/prisma/client";

import {
  ALL_CHALLENGE_STATUSES,
  ALL_DOMAINS,
  ALL_PRIORITIES,
  CHALLENGE_DOMAIN_LABELS,
} from "@/lib/constants";
import { getCurrentUser } from "@/server/auth/session.service";
import { listChallengesFor } from "@/server/challenges/challenge.service";
import { Header } from "@/components/layout/header";
import { ChallengeCard } from "@/features/challenges/challenge-card";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 18;

function parseFlag<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; domain?: string; priority?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  const status = parseFlag<ChallengeStatus>(params.status, ALL_CHALLENGE_STATUSES as readonly ChallengeStatus[]);
  const domain = parseFlag<ChallengeDomain>(params.domain, ALL_DOMAINS as readonly ChallengeDomain[]);
  const priority = parseFlag<ChallengePriority>(params.priority, ALL_PRIORITIES as readonly ChallengePriority[]);
  const page = Math.max(1, Number(params.page) || 1);

  const { items, pages } = await listChallengesFor(user, {
    page,
    pageSize: PAGE_SIZE,
    status,
    domain,
    priority,
  });

  function href(overrides: Record<string, string>) {
    const merged = { ...params, ...overrides, page: "1" };
    const search = new URLSearchParams(merged).toString();
    return `/challenges${search ? `?${search}` : ""}`;
  }

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Challenges</h1>
            <p className="mt-0.5 text-sm text-gray-500">Validated community problems waiting to become solutions.</p>
          </div>
          {user && (
            <Link href="/citizen/submit" className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              Report a problem
            </Link>
          )}
        </div>

        <form className="mt-5 flex flex-wrap gap-2" method="get" action="/challenges">
          <SelectFilter name="status" value={status ?? ""} options={[{ value: "", label: "All statuses" }, ...ALL_CHALLENGE_STATUSES.map((s) => ({ value: s, label: s.replaceAll("_", " ") }))]} />
          <SelectFilter name="domain" value={domain ?? ""} options={[{ value: "", label: "All domains" }, ...ALL_DOMAINS.map((d) => ({ value: d, label: CHALLENGE_DOMAIN_LABELS[d] }))]} />
          <SelectFilter name="priority" value={priority ?? ""} options={[{ value: "", label: "All priorities" }, ...ALL_PRIORITIES.map((p) => ({ value: p, label: p }))]} />
          <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Filter
          </button>
          {(status || domain || priority) && (
            <Link href="/challenges" className="rounded-md px-3 py-2 text-sm font-medium text-teal-700 hover:underline">
              Clear
            </Link>
          )}
        </form>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No challenges match these filters" />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={{
                  id: challenge.id,
                  title: challenge.title,
                  description: challenge.description,
                  district: challenge.district,
                  primaryDomain: challenge.primaryDomain,
                  status: challenge.status,
                  priority: challenge.priority,
                  createdAt: challenge.createdAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <Link
              href={page > 1 ? `${href({ page: String(page - 1) })}` : "#"}
              className={`rounded-md px-3 py-1.5 ${page <= 1 ? "pointer-events-none text-gray-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Previous
            </Link>
            <span className="px-2 text-gray-500">Page {page} of {pages}</span>
            <Link
              href={page < pages ? `${href({ page: String(page + 1) })}` : "#"}
              className={`rounded-md px-3 py-1.5 ${page >= pages ? "pointer-events-none text-gray-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Next
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

function SelectFilter({
  name,
  value,
  options,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select name={name} defaultValue={value} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}