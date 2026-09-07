import Link from "next/link";
import { redirect } from "next/navigation";

import { CHALLENGE_DOMAIN_LABELS } from "@/lib/constants";
import { getCurrentUser } from "@/server/auth/session.service";
import { hasPermission } from "@/lib/auth/rbac";
import { getIndustryDashboard } from "@/server/analytics/analytics.service";
import { listInterestForUser } from "@/server/industry/industry.service";
import { findOrganizationIdForUser } from "@/repositories/industry.repo";
import { OrganizationType } from "@/generated/prisma/client";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

const ORG_TYPES: OrganizationType[] = [
  OrganizationType.INDUSTRY,
  OrganizationType.STARTUP,
  OrganizationType.MSME,
  OrganizationType.CSR,
];

export default async function IndustryDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "dashboard:industry")) redirect("/");

  let overview = null;
  let interests: Awaited<ReturnType<typeof listInterestForUser>> = [];
  try {
    const organizationId = await findOrganizationIdForUser(user.id, ORG_TYPES);
    overview = await getIndustryDashboard(user, organizationId);
    interests = await listInterestForUser(user);
  } catch {
    overview = null;
  }

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900">Industry dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {overview ? "Track your collaboration with universities in the innovation portfolio." : "No industry profile is linked to this account yet."}
        </p>

        {overview && (
          <section className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Metric label="Collaborations" value={overview.collaborations} />
            <Metric label="Supported projects" value={overview.supportedProjects} />
            <Metric label="Mentorship" value={overview.mentorship} />
            <Metric label="Funding" value={overview.funding} />
            <Metric label="Pilots" value={overview.pilots} />
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Your expressions of interest</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Browse <Link href="/challenges" className="text-teal-700 hover:underline">validated challenges</Link> and express interest from a challenge page.
          </p>
          {interests.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No interests yet" description="Express interest on any validated challenge to offer mentorship, funding, technology or pilot support." />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {interests.map((interest) => (
                <Card key={interest.id}>
                  <CardBody>
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/challenges/${interest.challengeId}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {interest.challenge?.title ?? "Challenge"}
                      </Link>
                      {interest.challenge && <StatusBadge status={interest.challenge.status as never} />}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {interest.roles.map((role) => (
                        <span key={role} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{role}</span>
                      ))}
                    </div>
                    {interest.notes ? <p className="mt-2 text-sm text-gray-600">{interest.notes}</p> : null}
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