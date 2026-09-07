import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/session.service";
import { Header } from "@/components/layout/header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <>
      <Header user={null} />
      <main className="mx-auto flex w-full max-w-lg flex-1 px-4 py-12">
        <Card className="w-full">
          <CardHeader
            title="Create an account"
            subtitle={<>Start by reporting a community problem. <Link href="/challenges" className="text-teal-700 hover:underline">Browse examples</Link>.</>}
          />
          <CardBody>
            <RegisterForm />
          </CardBody>
        </Card>
      </main>
    </>
  );
}