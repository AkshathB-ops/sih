import { redirect } from "next/navigation";

import { CHALLENGE_DOMAIN_LABELS } from "@/lib/constants";
import { getCurrentUser } from "@/server/auth/session.service";
import { listProjectsForUser } from "@/server/projects/project.service";
import { Header } from "@/components/layout/header";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projectView = await listProjectsForUser(user);
  const items = projectView.items ?? [];

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        <p className="mt-0.5 text-sm text-gray-500">Solutions your organization is developing.</p>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No projects found" description="Projects are created from accepted challenges by your organization." />
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((p) => (
              <Card key={p.id}>
                <CardBody>
                  <p className="text-xs font-medium text-teal-700">
                    {p.challenge ? CHALLENGE_DOMAIN_LABELS[p.challenge.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS] : ""}
                  </p>
                  <a href={`/projects/${p.id}`} className="mt-0.5 block font-medium text-gray-900 hover:underline">
                    {p.title}
                  </a>
                  <p className="mt-1 text-xs text-gray-500">Created {p.createdAt.toLocaleDateString()}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}