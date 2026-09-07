import Link from "next/link";

import { CHALLENGE_DOMAIN_LABELS } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/server/auth/session.service";
import { listChallengesFor } from "@/server/challenges/challenge.service";
import { ChallengeCard } from "@/features/challenges/challenge-card";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const { items } = await listChallengesFor(user, { page: 1, pageSize: 6 });

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-6xl px-4">
        <section className="rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-700 px-6 py-14 text-white">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Turn Jharkhand&apos;s most pressing problems into real solutions.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-teal-50 sm:text-base">
            Report a community problem. Government validates and matches it to universities, startups and
            industry. Teams collaborate, prototype, pilot — and the solution reaches the ground.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/citizen/submit"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50"
            >
              Report a Community Problem
            </Link>
            <Link
              href="/challenges"
              className="rounded-md border border-teal-200 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
            >
              Browse Challenges
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Featured challenges</h2>
            <Link href="/challenges" className="text-sm font-medium text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              No validated challenges yet. Be the first to report one.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={{
                    id: challenge.id,
                    title: challenge.title,
                    description: challenge.description,
                    district: challenge.district,
                    primaryDomain: challenge.primaryDomain,
                    status: challenge.status,
                    priority: challenge.priority,
                    createdAt: challenge.createdAt.toISOString(),
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 mb-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">How it works</h2>
          <ol className="mt-4 grid gap-4 text-sm text-gray-700 sm:grid-cols-5">
            {[
              ["Report", "Citizens describe the problem, location, domain and impact."],
              ["Validate", "Government reviews evidence and prioritizes."],
              ["Match", "Universities, startups and industry are matched by capability."],
              ["Collaborate", "Teams build and pilot solutions together."],
              ["Impact", "Solutions reach communities and scale."],
            ].map(([step, description]) => (
              <li key={step} className="rounded-lg border border-gray-100 p-3">
                <p className="font-semibold text-teal-800">{step}</p>
                <p className="mt-1 text-gray-600">{description}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}