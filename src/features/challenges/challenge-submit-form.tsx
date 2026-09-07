"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CHALLENGE_DOMAIN_LABELS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { FieldWrapper, Input, Select, Textarea } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";

const DOMAINS = Object.keys(CHALLENGE_DOMAIN_LABELS);
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const DISTRICTS = [
  "Ranchi", "Bokaro", "Dhanbad", "East Singhbhum", "West Singhbhum", "Godda",
  "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga",
  "Pakur", "Palamu", "Ramgarh", "Sahibganj", "Saraikela Kharsawan", "Simdega", "Deoghar", "Giridih",
];

interface EvidenceFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
}

const STEPS = ["Problem", "Location", "Domain", "Impact", "Evidence", "Review"];

export function ChallengeSubmitForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    problemStatement: "",
    district: "Ranchi",
    block: "",
    villageWard: "",
    primaryDomain: "WATER_RESOURCES",
    secondaryDomains: [] as string[],
    tags: [] as string[],
    urgency: "MEDIUM",
    affectedPopulation: "",
    geographicScope: "",
    asDraft: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDomain(domain: string) {
    setForm((prev) => ({
      ...prev,
      secondaryDomains: prev.secondaryDomains.includes(domain)
        ? prev.secondaryDomains.filter((d) => d !== domain)
        : [...prev.secondaryDomains, domain].slice(0, 5),
    }));
  }

  function addTag() {
    const value = tagInput.trim();
    if (value && !form.tags.includes(value)) {
      update("tags", [...form.tags, value.slice(0, 32)]);
    }
    setTagInput("");
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return form.title.trim().length >= 5 && form.description.trim().length >= 20;
      case 1:
        return form.district.trim().length > 0;
      case 2:
        return form.primaryDomain.length > 0;
      default:
        return true;
    }
  }

  async function saveDraft() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, asDraft: true }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message ?? "Could not save draft");
      router.refresh();
      setStep(5);
      setSubmittedId(payload.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, asDraft: false }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message ?? "Submission failed");
      const challengeId: string = payload.data.id;
      setSubmittedId(challengeId);

      for (const item of evidence) {
        item.status = "uploading";
        const uploadRes = await fetch(`/api/challenges/${challengeId}/evidence`, {
          method: "POST",
          body: (() => {
            const fd = new FormData();
            fd.append("file", item.file);
            return fd;
          })(),
        });
        item.status = uploadRes.ok ? "done" : "error";
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  if (submittedId) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
        <p className="text-lg font-semibold text-emerald-900">Thanks — your challenge was submitted.</p>
        <p className="mt-1 text-sm text-emerald-700">It is now awaiting government review and validation.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href={`/challenges/${submittedId}`} className="text-sm font-medium text-teal-700 hover:underline">
            View your challenge
          </Link>
          <Link href="/citizen/dashboard" className="text-sm font-medium text-teal-700 hover:underline">
            Go to My Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-6 flex flex-wrap gap-1.5 text-xs font-medium text-gray-500">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`rounded-full px-2.5 py-1 ${index === step ? "bg-teal-700 text-white" : index < step ? "bg-teal-100 text-teal-800" : "bg-gray-100"}`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}

      {step === 0 && (
        <div className="space-y-4">
          <FieldWrapper label="What is the problem?" htmlFor="title" hint="A short, plain-language title.">
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Erratic water supply in Harmu slum" />
          </FieldWrapper>
          <FieldWrapper label="Describe it in your own words" htmlFor="description" hint="Who is affected and what happens in day-to-day life? (at least 20 characters)">
            <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell us what you see, when it happens and how people are affected…" />
          </FieldWrapper>
          <FieldWrapper label="What would a solution look like?" htmlFor="problemStatement" hint="Optional — plain language is fine.">
            <Textarea id="problemStatement" value={form.problemStatement} onChange={(e) => update("problemStatement", e.target.value)} />
          </FieldWrapper>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <FieldWrapper label="District" htmlFor="district">
            <Select id="district" value={form.district} onChange={(e) => update("district", e.target.value)}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Block / Circle (optional)" htmlFor="block">
            <Input id="block" value={form.block} onChange={(e) => update("block", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Village / Ward (optional)" htmlFor="villageWard">
            <Input id="villageWard" value={form.villageWard} onChange={(e) => update("villageWard", e.target.value)} />
          </FieldWrapper>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <FieldWrapper label="Main domain" htmlFor="primaryDomain">
            <Select id="primaryDomain" value={form.primaryDomain} onChange={(e) => update("primaryDomain", e.target.value as string)}>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>{CHALLENGE_DOMAIN_LABELS[d as keyof typeof CHALLENGE_DOMAIN_LABELS]}</option>
              ))}
            </Select>
          </FieldWrapper>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Related domains (up to 5, optional)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DOMAINS.filter((d) => d !== form.primaryDomain).map((d) => {
                const selected = form.secondaryDomains.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDomain(d)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${selected ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    aria-pressed={selected}
                  >
                    {CHALLENGE_DOMAIN_LABELS[d as keyof typeof CHALLENGE_DOMAIN_LABELS]}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <FieldWrapper label="Tags / keywords" htmlFor="tagInput" hint="Press Enter to add. Helps matching.">
            <div className="flex gap-2">
              <Input id="tagInput" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="e.g. flood" />
              <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <button key={t} type="button" onClick={() => update("tags", form.tags.filter((x) => x !== t))} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700 hover:bg-gray-200">
                    {t} ×
                  </button>
                ))}
              </div>
            )}
          </FieldWrapper>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <FieldWrapper label="How urgent is it?" htmlFor="urgency" hint="Critical = immediate danger or large-scale harm.">
            <Select id="urgency" value={form.urgency} onChange={(e) => update("urgency", e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="How many people are affected?" htmlFor="affectedPopulation" hint="Approximate numbers are fine, e.g. '~4,000 residents'.">
            <Input id="affectedPopulation" value={form.affectedPopulation} onChange={(e) => update("affectedPopulation", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="How big is the affected area?" htmlFor="geographicScope" hint="e.g. one ward, one block, or district-wide.">
            <Input id="geographicScope" value={form.geographicScope} onChange={(e) => update("geographicScope", e.target.value)} />
          </FieldWrapper>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <FieldWrapper label="Evidence (photos, documents or short videos)" htmlFor="evidence" hint="Photos under 8 MB, videos under 50 MB, documents under 10 MB. Evidence is only shown to reviewers.">
            <Input id="evidence" type="file" multiple accept="image/*,video/mp4,application/pdf,.doc,.docx,.csv,.txt" onChange={(e) => setEvidence(Array.from(e.target.files ?? []).map((f) => ({ file: f, status: "pending" as const })))} />
          </FieldWrapper>
          {evidence.length > 0 && (
            <ul className="space-y-1 text-sm text-gray-700">
              {evidence.map((item, index) => (
                <li key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                  <span className="truncate">{item.file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{(item.file.size / 1024).toFixed(0)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 text-sm">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div><dt className="text-gray-500">Title</dt><dd className="font-medium">{form.title}</dd></div>
              <div><dt className="text-gray-500">Location</dt><dd className="font-medium">{form.district}{form.block ? `, ${form.block}` : ""}</dd></div>
              <div><dt className="text-gray-500">Domain</dt><dd className="font-medium">{CHALLENGE_DOMAIN_LABELS[form.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS]}</dd></div>
              <div><dt className="text-gray-500">Urgency</dt><dd className="font-medium">{form.urgency}</dd></div>
            </dl>
            <p className="mt-3 text-gray-600">{form.description}</p>
            <p className="mt-2 text-xs text-gray-500">Tags: {form.tags.length ? form.tags.join(", ") : "—"} · Evidence files: {evidence.length}</p>
          </div>
          <p className="text-sm text-gray-500">
            On submission, your report is placed in the government review queue. Nothing is published publicly until a challenge is validated.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={saveDraft} disabled={busy}>
            {busy ? <LoadingStateInline /> : "Save draft"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canProceed()}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={busy}>
              {busy ? <LoadingStateInline /> : "Submit challenge"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingStateInline() {
  return <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />Working…</span>;
}