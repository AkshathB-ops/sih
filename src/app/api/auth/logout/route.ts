import { handle, ok } from "@/lib/api/response";
import { clearSessionCookieHeader } from "@/lib/auth/session";
import { destroyCurrentSession } from "@/server/auth/session.service";

export const POST = handle(async () => {
  await destroyCurrentSession();
  return ok({ loggedOut: true }, 200, { "Set-Cookie": clearSessionCookieHeader() });
});