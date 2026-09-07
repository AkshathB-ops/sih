// Opaque database-backed session tokens in an httpOnly cookie.
// The session is resolved server-side; the browser never supplies identity.

import { createHash, randomBytes } from "node:crypto";

import { env } from "@/lib/config/env";

export const SESSION_COOKIE_NAME = env.sessionCookieName;
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export interface CookieReaderLike {
  get(name: string): { value: string } | null | undefined;
}

export function readSessionToken(cookies: CookieReaderLike): string | null {
  return cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function sessionCookieHeader(token: string): string {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    env.isProduction ? "Secure" : "",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookieHeader(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    env.isProduction ? "Secure" : "",
    "SameSite=Lax",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
}