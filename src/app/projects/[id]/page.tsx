import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/session.service";
import { hasPermission } from "@/lib/auth/rbac";
import { getProjectFor } from "@/server/projects/project.service";
import { listForProject } from "@/server/comments/comment.service";
import { Header } from "@/components/layout/header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { CommentThread } from "@/features/comments/comment-thread";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "project:viewAll")) redirect("/");

  const project = await getProjectFor(user, id);
  const comments = await listForProject(project.id);
  const isMember = project.members.some((m) => m.userId === user.id);
  const isLead = project.members.some((m) => m.userId === user.id && m.isLead);

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Associated with{" "}
          <a href={`/challenges/${project.challenge.id}`} className="text-teal-700 hover:underline">
            {project.challenge.title}
          </a>
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{project.title}</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader title="Overview" />
              <CardBody>
                <p className="text-sm text-gray-700">{project.description ?? "No description provided."}</p>
                {project.objectives ? (
                  <p className="mt-3 text-sm text-gray-700"><span className="font-medium text-gray-900">Objectives:</span> {project.objectives}</p>
                ) : null}
                {project.methodology ? (
                  <p className="mt-1 text-sm text-gray-700"><span className="font-medium text-gray-900">Methodology:</span> {project.methodology}</p>
                ) : null}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={`Milestones (${project.milestones.length})`} />
              <CardBody>
                {project.milestones.length === 0 ? (
                  <EmptyState title="No milestones yet" />
                ) : (
                  <ol className="space-y-3">
                    {project.milestones.map((m) => (
                      <li key={m.id} className="rounded-md border border-gray-100 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-gray-900">{m.name}</p>
                          {m.dueDate ? <span className="text-xs text-gray-400">{new Date(m.dueDate).toLocaleDateString()}</span> : null}
                        </div>
                        {m.description ? <p className="mt-1 text-sm text-gray-600">{m.description}</p> : null}
                        {m.deliverables.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {m.deliverables.map((d) => (
                              <li key={d.id} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className={d.status === "COMPLETED" ? "text-emerald-600" : "text-gray-300"}>●</span>
                                {d.name}
                                <span className="text-gray-400">({d.status.replaceAll("_", " ").toLowerCase()})</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Discussion" />
              <CardBody>
                <CommentThread
                  projectId={project.id}
                  initialComments={comments.map((c) => ({
                    id: c.id,
                    content: c.content,
                    createdAt: c.createdAt.toISOString(),
                    author: c.author,
                  }))}
                  canComment={isMember}
                />
              </CardBody>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader title="Team" />
              <CardBody>
                {project.members.length === 0 ? (
                  <EmptyState title="No members" />
                ) : (
                  <ul className="space-y-2 text-sm">
                    {project.members.map((m) => (
                      <li key={m.id} className="flex items-center justify-between">
                        <span className="text-gray-800">{m.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {m.role}
                          {m.isLead ? " · Lead" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {isLead && <p className="mt-3 text-xs text-gray-500">Members can be added via the API (POST /api/projects/{id}/members).</p>}
              </CardBody>
            </Card>

            {(project.collaborations.length > 0 || project.documents.length > 0 || project.impactMetrics.length > 0) && (
              <Card>
                <CardHeader title="More" />
                <CardBody className="space-y-3 text-sm text-gray-700">
                  {project.collaborations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Industry collaborators</p>
                      <ul className="mt-1 space-y-1">
                        {project.collaborations.map((c) => (
                          <li key={c.id}>{c.organization.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.impactMetrics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Impact metrics</p>
                      <ul className="mt-1 space-y-1">
                        {project.impactMetrics.map((m) => (
                          <li key={m.id}>{m.key}: {m.value}{m.unit ? ` ${m.unit}` : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}