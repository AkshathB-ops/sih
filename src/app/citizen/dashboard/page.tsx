import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/session.service";
import { hasPermission } from "@/lib/auth/rbac";
import { listChallengesFor } from "@/server/challenges/challenge.service";
import { Header } from "@/components/layout/header";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { CHALLENGE_DOMAIN_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CitizenDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "challenge:create")) redirect("/");

  const { items } = await listChallengesFor(user, { page: 1, pageSize: 50, mine: true });

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Your reports</h1>
            <p className="mt-0.5 text-sm text-gray-500">Follow the progress of the problems you reported.</p>
          </div>
          <Link
            href="/citizen/submit"
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Report a problem
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No reports yet"
              description="Report your first community problem — it takes about five minutes."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-teal-700">{CHALLENGE_DOMAIN_LABELS[c.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS] ?? c.primaryDomain}</span>
                      <span>·</span>
                      <span>{c.district}</span>
                      <span>·</span>
                      <span>{c.createdAt.toLocaleDateString()}</span>
                    </div>
                    <Link href={`/challenges/${c.id}`} className="mt-1 block font-medium text-gray-900 hover:underline">
                      {c.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={c.priority as never} />
                    <StatusBadge status={c.status as never} />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}