import { handle, ok, parse, readJson } from "@/lib/api/response";
import { sessionCookieHeader } from "@/lib/auth/session";
import { loginUser } from "@/server/auth/auth.service";
import { loginSchema } from "@/validations/auth";

export const POST = handle(async (request: Request) => {
  const body = parse(loginSchema, await readJson(request));
  const { user, token } = await loginUser(body);

  return ok({ user }, 200, { "Set-Cookie": sessionCookieHeader(token) });
});