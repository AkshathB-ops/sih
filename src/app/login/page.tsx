import Link from "next/link";

import { getCurrentUser } from "@/server/auth/session.service";
import { Header } from "@/components/layout/header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <>
      <Header user={null} />
      <main className="mx-auto flex w-full max-w-lg flex-1 px-4 py-12">
        <Card className="w-full">
          <CardHeader title="Sign in" subtitle="Welcome back to the Jharkhand Innovation Portal" />
          <CardBody>
            <LoginForm />
            <p className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Demo accounts (password <code className="font-mono">Demo@1234</code>):{" "}
              <Link href="/register" className="text-teal-700 hover:underline">register</Link>{" "}
              or use seeded users like <code className="font-mono">citizen@example.com</code>,{" "}
              <code className="font-mono">gov@jharkha.in</code>,{" "}
              <code className="font-mono">admin@jharkha.in</code>.
            </p>
          </CardBody>
        </Card>
      </main>
    </>
  );
}