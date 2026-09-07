import Link from "next/link";

import {
  CHALLENGE_DOMAIN_LABELS,
  CHALLENGE_PRIORITY_LABELS,
  CHALLENGE_STATUS_LABELS,
} from "@/lib/constants";
import { hasPermission } from "@/lib/auth/rbac";
import { getCurrentUser } from "@/server/auth/session.service";
import { getChallengeFor } from "@/server/challenges/challenge.service";
import { listForChallenge } from "@/server/comments/comment.service";
import { listOrganizations } from "@/repositories/organization.repo";
import { Header } from "@/components/layout/header";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ChallengeActions, type ActionScope } from "@/features/challenges/challenge-actions";
import { CommentThread, type CommentItem } from "@/features/comments/comment-thread";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { challenge, fullAccess } = await getChallengeFor(user, id);

  let organizations: { id: string; name: string }[] = [];
  const scope: ActionScope = {
    canSubmitDraft: Boolean(user && challenge.userId === user.id && challenge.status === "DRAFT"),
    canReview: Boolean(user && hasPermission(user.role, "challenge:review")),
    canAssign: Boolean(user && hasPermission(user.role, "challenge:assign")),
    canTransition: Boolean(user && hasPermission(user.role, "challenge:transition")),
    canComment: Boolean(user && hasPermission(user.role, "challenge:comment")),
    canExpressInterest: Boolean(user && hasPermission(user.role, "industry:expressInterest")),
    hasInterest: false,
  };

  if (scope.canAssign) {
    organizations = (await listOrganizations({ page: 1, pageSize: 100 })).items.map((o) => ({
      id: o.id,
      name: o.name,
    }));
  }

  const comments = fullAccess ? await listForChallenge(challenge.id) : [];

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Link href="/challenges" className="text-sm font-medium text-teal-700 hover:underline">
          ← All challenges
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={challenge.status as never} />
          <PriorityBadge priority={challenge.priority as never} />
          <span className="text-xs text-gray-500">· {challenge.district}</span>
          <span className="text-xs text-gray-500">· Reported by {challenge.user.name}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">{challenge.title}</h1>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">
            {CHALLENGE_DOMAIN_LABELS[challenge.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS] ?? challenge.primaryDomain}
          </span>
          {challenge.secondaryDomains.map((d) => (
            <span key={d} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
              {CHALLENGE_DOMAIN_LABELS[d as keyof typeof CHALLENGE_DOMAIN_LABELS] ?? d}
            </span>
          ))}
          {challenge.tags.map((t) => (
            <span key={t} className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-500">#{t}</span>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader title="Description" />
              <CardBody>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{challenge.description}</p>
                {challenge.problemStatement ? (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">What a solution could look like</p>
                    <p className="mt-1 text-sm text-gray-700">{challenge.problemStatement}</p>
                  </div>
                ) : null}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Details" />
              <CardBody>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Detail label="Location" value={[challenge.district, challenge.block, challenge.villageWard].filter(Boolean).join(", ")} />
                  <Detail label="Priority" value={CHALLENGE_PRIORITY_LABELS[challenge.priority as keyof typeof CHALLENGE_PRIORITY_LABELS] ?? challenge.priority} />
                  <Detail label="Urgency" value={challenge.urgency} />
                  <Detail label="Affected population" value={challenge.affectedPopulation ?? "—"} />
                  <Detail label="Geographic scope" value={challenge.geographicScope ?? "—"} />
                  <Detail label="Submitted" value={challenge.createdAt.toLocaleDateString()} />
                  {challenge.assignedOrganization ? (
                    <Detail label="Assigned to" value={challenge.assignedOrganization.name} />
                  ) : null}
                </dl>
              </CardBody>
            </Card>

            {fullAccess && challenge.evidence.length > 0 && (
              <Card>
                <CardHeader title={`Evidence (${challenge.evidence.length})`} />
                <CardBody>
                  <ul className="space-y-2">
                    {challenge.evidence.map((e) => (
                      <li key={e.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                        <span className="truncate text-gray-800">{e.originalName}</span>
                        <span className="ml-3 flex items-center gap-2 text-xs text-gray-500">
                          <span>{e.kind}</span>
                          <span>·</span>
                          <span>{(e.sizeBytes / 1024).toFixed(0)} KB</span>
                          <a
                            href={`/api/files/${e.storageKey}`}
                            className="font-medium text-teal-700 hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}

            {fullAccess && challenge.reviews.length > 0 && (
              <Card>
                <CardHeader title="Reviews" />
                <CardBody>
                  <ul className="space-y-3">
                    {challenge.reviews.map((r) => (
                      <li key={r.id} className="border-l-2 border-teal-200 pl-3">
                        <p className="text-sm font-medium text-gray-800">
                          {r.decision.replaceAll("_", " ")} <span className="font-normal text-gray-500">· {r.reviewer?.name ?? "Reviewer"}</span>
                        </p>
                        {r.notes ? <p className="mt-0.5 text-sm text-gray-600">{r.notes}</p> : null}
                        <p className="mt-0.5 text-xs text-gray-400">{r.createdAt.toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}

            {fullAccess && (
              <Card>
                <CardBody>
                  <CommentThread
                    challengeId={challenge.id}
                    initialComments={comments.map((c) => ({
                      id: c.id,
                      content: c.content,
                      createdAt: c.createdAt.toISOString(),
                      author: c.author,
                    }))}
                    canComment={scope.canComment}
                  />
                </CardBody>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <ChallengeActions
              challengeId={challenge.id}
              status={challenge.status as string}
              scope={scope}
              organizations={organizations}
            />

            {fullAccess && (
              <Card>
                <CardHeader title="Status history" />
                <CardBody>
                  {challenge.statusHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No status changes yet.</p>
                  ) : (
                    <ol className="space-y-2 text-sm">
                      {challenge.statusHistory.map((h) => (
                        <li key={h.id} className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-800">{CHALLENGE_STATUS_LABELS[h.toStatus] ?? h.toStatus}</p>
                            {h.note ? <p className="text-xs text-gray-500">{h.note}</p> : null}
                          </div>
                          <span className="shrink-0 text-xs text-gray-400">{h.createdAt.toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ol>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-800">{value}</dd>
    </div>
  );
}