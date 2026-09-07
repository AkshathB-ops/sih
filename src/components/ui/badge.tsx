import { ChallengeStatus, ChallengePriority } from "@/generated/prisma/client";

import {
  CHALLENGE_STATUS_LABELS,
  CHALLENGE_PRIORITY_LABELS,
} from "@/lib/constants";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-indigo-100 text-indigo-800",
  VALIDATION_REQUIRED: "bg-amber-100 text-amber-800",
  VALIDATED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
  MATCHING: "bg-purple-100 text-purple-800",
  ASSIGNED: "bg-sky-100 text-sky-800",
  ACCEPTED: "bg-cyan-100 text-cyan-800",
  IN_PROGRESS: "bg-teal-100 text-teal-800",
  PILOT: "bg-orange-100 text-orange-800",
  VALIDATION: "bg-lime-100 text-lime-800",
  IMPLEMENTED: "bg-green-100 text-green-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-gray-200 text-gray-600",
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: string }) {
  const styles: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    teal: "bg-teal-100 text-teal-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone] ?? styles.gray}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ChallengeStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT}`}>
      {CHALLENGE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ChallengePriority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.MEDIUM}`}>
      {CHALLENGE_PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}