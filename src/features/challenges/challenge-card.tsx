import Link from "next/link";

import { CHALLENGE_DOMAIN_LABELS } from "@/lib/constants";

import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";

type ChallengeSummary = {
  id: string;
  title: string;
  description: string;
  district: string;
  primaryDomain: string;
  status: string;
  priority: string;
  createdAt: string;
};

export function ChallengeCard({ challenge }: { challenge: ChallengeSummary }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-teal-700">{CHALLENGE_DOMAIN_LABELS[challenge.primaryDomain as keyof typeof CHALLENGE_DOMAIN_LABELS] ?? challenge.primaryDomain}</span>
          <span>·</span>
          <span>{challenge.district}</span>
        </div>
        <h3 className="mt-2 text-base font-semibold text-gray-900">
          <Link href={`/challenges/${challenge.id}`} className="hover:underline">
            {challenge.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{challenge.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <StatusBadge status={challenge.status as never} />
          <PriorityBadge priority={challenge.priority as never} />
        </div>
      </CardBody>
    </Card>
  );
}