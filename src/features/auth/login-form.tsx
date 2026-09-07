"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error?.message ?? "Login failed");
        return;
      }
      router.refresh();
      router.push(routeFor(payload.data.user.role));
    } catch {
      setError("Unable to reach the server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? <ErrorState message={error} /> : null}
      <FieldWrapper label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FieldWrapper>
      <FieldWrapper label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FieldWrapper>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-gray-500">
        New here?{" "}
        <Link href="/register" className="font-medium text-teal-700 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

function routeFor(role: string): string {
  switch (role) {
    case "CITIZEN":
      return "/citizen/dashboard";
    case "GOVERNMENT":
    case "ADMIN":
      return "/admin/dashboard";
    case "UNIVERSITY_ADMIN":
    case "FACULTY":
    case "STUDENT":
    case "MENTOR":
      return "/university/dashboard";
    case "INDUSTRY":
      return "/industry/dashboard";
    default:
      return "/";
  }
}