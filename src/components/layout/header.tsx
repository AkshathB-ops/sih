import Link from "next/link";

import { ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/types";
import { SignOutButton } from "@/components/layout/sign-out-button";

function destinations(role: string | undefined) {
  if (!role) return [];
  switch (role) {
    case "CITIZEN":
      return [
        { href: "/citizen/dashboard", label: "My Reports" },
        { href: "/citizen/submit", label: "Report a Problem" },
      ];
    case "GOVERNMENT":
    case "ADMIN":
      return [
        { href: "/admin/dashboard", label: "Challenge Queue" },
        { href: "/challenges", label: "All Challenges" },
      ];
    case "UNIVERSITY_ADMIN":
    case "FACULTY":
    case "STUDENT":
    case "MENTOR":
      return [
        { href: "/university/dashboard", label: "University Dashboard" },
        { href: "/challenges", label: "Challenges" },
      ];
    case "INDUSTRY":
      return [
        { href: "/industry/dashboard", label: "Industry Dashboard" },
        { href: "/challenges", label: "Challenges" },
      ];
    default:
      return [{ href: "/challenges", label: "Challenges" }];
  }
}

export async function Header({ user }: { user: SessionUser | null }) {
  const links = destinations(user?.role);

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-teal-800">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-teal-700 text-sm font-bold text-white">JS</span>
          <span className="hidden sm:inline">Jharkhand Innovation Portal</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-gray-700 hover:bg-gray-100"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <span className="ml-2 hidden rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 md:inline">
                {user.name} · {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-1.5 text-gray-700 hover:bg-gray-100">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}