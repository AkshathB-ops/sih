"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", district: "Ranchi" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error?.message ?? "Registration failed");
        return;
      }
      router.refresh();
      router.push("/citizen/submit");
    } catch {
      setError("Unable to reach the server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? <ErrorState message={error} /> : null}
      <FieldWrapper label="Full name" htmlFor="name">
        <Input id="name" required autoComplete="name" value={form.name} onChange={update("name")} />
      </FieldWrapper>
      <FieldWrapper label="Email" htmlFor="email" hint="A confirmation email is not sent in this preview.">
        <Input id="email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
      </FieldWrapper>
      <FieldWrapper label="Password" htmlFor="password" hint="At least 8 characters with letters and numbers.">
        <Input id="password" type="password" required autoComplete="new-password" value={form.password} onChange={update("password")} />
      </FieldWrapper>
      <FieldWrapper label="District" htmlFor="district">
        <Input id="district" required value={form.district} onChange={update("district")} />
      </FieldWrapper>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-teal-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}