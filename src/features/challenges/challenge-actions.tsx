"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldWrapper, Select, Textarea } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";

export interface ActionScope {
  canSubmitDraft: boolean;
  canReview: boolean;
  canAssign: boolean;
  canTransition: boolean;
  canComment: boolean;
  canExpressInterest: boolean;
  hasInterest: boolean;
}

const REVIEW_STATES = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "VALIDATION_REQUIRED", label: "Validation required" },
  { value: "VALIDATED", label: "Validated" },
  { value: "REJECTED", label: "Rejected" },
  { value: "MATCHING", label: "Matching" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PILOT", label: "Pilot" },
  { value: "VALIDATION", label: "Validation" },
  { value: "IMPLEMENTED", label: "Implemented" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "ARCHIVED", label: "Archived" },
];

export function ChallengeActions({
  challengeId,
  status,
  scope,
  organizations,
}: {
  challengeId: string;
  status: string;
  scope: ActionScope;
  organizations: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState("APPROVED");
  const [notes, setNotes] = useState("");
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "");
  const [toStatus, setToStatus] = useState("");
  const [roles, setRoles] = useState<string[]>(["MENTORSHIP"]);

  async function call(path: string, body?: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error?.message ?? "Action failed");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Unable to reach the server");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!scope.canSubmitDraft && !scope.canReview && !scope.canAssign && !scope.canTransition && !scope.canComment && !scope.canExpressInterest) {
    return null;
  }

  const errorBox = error ? <div className="mb-3"><ErrorState message={error} /></div> : null;

  return (
    <div className="space-y-5">
      {errorBox}

      {scope.canSubmitDraft && (
        <Panel title="Submission">
          <p className="text-sm text-gray-600">This is a draft. Submit it when you are ready for government review.</p>
          <Button
            disabled={busy}
            className="mt-2"
            onClick={async () => {
              if (await call(`/api/challenges/${challengeId}/submit`)) setNotes("");
            }}
          >
            Submit for review
          </Button>
        </Panel>
      )}

      {scope.canReview && (
        <Panel title="Review">
          <div className="grid gap-3">
            <FieldWrapper label="Decision">
              <Select value={reviewDecision} onChange={(e) => setReviewDecision(e.target.value)}>
                <option value="APPROVED">Approve (mark validated)</option>
                <option value="REJECTED">Reject</option>
                <option value="REQUIRES_MORE_INFO">Request more information</option>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Review notes">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FieldWrapper>
            <Button
              disabled={busy}
              onClick={async () => {
                if (await call(`/api/challenges/${challengeId}/review`, { decision: reviewDecision, notes })) setNotes("");
              }}
            >
              Record decision
            </Button>
          </div>
        </Panel>
      )}

      {scope.canAssign && (
        <Panel title="Assign to an organization">
          <div className="grid gap-3">
            <FieldWrapper label="Organization">
              <Select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Notes (optional)">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FieldWrapper>
            <Button
              disabled={busy || !orgId}
              onClick={async () => {
                if (await call(`/api/challenges/${challengeId}/assign`, { organizationId: orgId, notes })) setNotes("");
              }}
            >
              Assign challenge
            </Button>
          </div>
        </Panel>
      )}

      {scope.canTransition && (
        <Panel title="Change status">
          <div className="grid gap-3">
            <FieldWrapper label="Next status (must be a valid transition)">
              <Select value={toStatus} onChange={(e) => setToStatus(e.target.value)}>
                <option value="">Select…</option>
                {REVIEW_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </FieldWrapper>
            <Button disabled={busy || !toStatus} onClick={() => call(`/api/challenges/${challengeId}/transition`, { toStatus, note: notes })}>
              Change status
            </Button>
          </div>
        </Panel>
      )}

      {scope.canExpressInterest && (
        <Panel title="Industry collaboration">
          <p className="text-sm text-gray-600">Express interest to support this challenge.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["MENTORSHIP", "FUNDING", "TECHNOLOGY", "PILOT", "RESEARCH"].map((r) => {
              const selected = roles.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRoles((prev) => (selected ? prev.filter((x) => x !== r) : [...prev, r]))}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${selected ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  {r}
                </button>
              );
            })}
          </div>
          <Button className="mt-3" disabled={busy} onClick={() => call(`/api/challenges/${challengeId}/interest`, { roles, notes })}>
            Express interest
          </Button>
        </Panel>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </section>
  );
}