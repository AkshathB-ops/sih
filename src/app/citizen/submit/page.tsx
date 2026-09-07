import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/session.service";
import { hasPermission } from "@/lib/auth/rbac";
import { Header } from "@/components/layout/header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ChallengeSubmitForm } from "@/features/challenges/challenge-submit-form";

export const dynamic = "force-dynamic";

export default async function CitizenSubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "challenge:create")) redirect("/");

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <Card>
          <CardHeader title="Report a community problem" subtitle="Seven quick steps — in plain language. You can save a draft and continue later." />
          <CardBody>
            <ChallengeSubmitForm />
          </CardBody>
        </Card>
      </main>
    </>
  );
}