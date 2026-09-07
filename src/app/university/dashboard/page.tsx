import Link from "next/link";
import { redirect } from "next/navigation";

import { CHALLENGE_DOMAIN_LABELS } from "@/lib/constants";
import { getCurrentUser } from "@/server/auth/session.service";
import { hasPermission } from "@/lib/auth/rbac";
import { getUniversityDashboard } from "@/server/analytics/analytics.service";
import { listProjectsForUser } from "@/server/projects/project.service";
import { listChallengesFor } from "@/server/challenges/challenge.service";
import { findOrganizationIdForUser } from "@/repositories/industry.repo";
import { OrganizationType } from "@/generated/prisma/client";
import { Header } from "@/components/layout/header";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export default async function UniversityDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "dashboard:university")) redirect("/");

  let organizationId: string | null = null;
  try {
    organizationId = await findOrganizationIdForUser(user.id, [OrganizationType.UNIVERSITY]);
  } catch {
    organizationId = null;
  }

  const overview = organizationId ? await getUniversityDashboard(user, organizationId) : null;
  const projects = await listProjectsForUser(user);
  const assigned = organizationId
    ? await listChallengesFor(user, { page: 1, pageSize: 12, assignedTo: organizationId })
    : { items: [] };

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900">University dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {organizationId ? "Challenges assigned to your institution and your active projects." : "No university profile is linked to this account yet."}
        </p>

        {overview && (
          <section className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="Assigned" value={overview.assigned} />
            <Metric label="Active projects" value={overview.activeProjects} />
            <Metric label="Completed" value={overview.completedProjects} />
            <Metric label="Faculty" value={overview.faculty} />
            <Metric label="Students" value={overview.students} />
            <Metric label="Industry collabs" value={overview.collaborations} />
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Assigned challenges</h2>
          {assigned.items.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No assigned challenges" description="The government assigns validated challenges based on your capabilities." />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {assigned.items.map((c) => (
                <Link key={c.id} href={`/challenges/${c.id}`} className="block">
                  <Card className="transition-shadow hover:shadow-md">
                    <CardBody>
                      <div className="text-xs text-gray-500">
                        {CHALLENGE_DOMAIN_LABELS[c.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS]} · {c.district}
                      </div>
                      <p className="mt-1 font-medium text-gray-900 line-clamp-2">{c.title}</p>
                      <div className="mt-2 flex gap-2">
                        <StatusBadge status={c.status as never} />
                        <PriorityBadge priority={c.priority as never} />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Your projects</h2>
          {projects.items.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No projects yet" description="Projects appear here once your institution starts working a challenge." />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {projects.items.map((p) => (
                <Card key={p.id}>
                  <CardBody>
                    <p className="text-xs text-gray-500">Project</p>
                    <Link href={`/projects/${p.id}`} className="mt-0.5 block font-medium text-gray-900 hover:underline">
                      {p.title}
                    </Link>
                    {p.challenge && (
                      <p className="mt-1 text-xs text-gray-500">
                        {CHALLENGE_DOMAIN_LABELS[p.challenge.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS]}
                      </p>
                    )}
                  </CardBody>
                </Card>
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
        <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      </CardBody>
    </Card>
  );
}