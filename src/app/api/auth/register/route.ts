import { handle, ok, parse, readJson } from "@/lib/api/response";
import { sessionCookieHeader } from "@/lib/auth/session";
import { registerUser } from "@/server/auth/auth.service";
import { registerSchema } from "@/validations/auth";

export const POST = handle(async (request: Request) => {
  const body = parse(registerSchema, await readJson(request));
  const { user, token } = await registerUser(body);

  return ok({ user }, 201, { "Set-Cookie": sessionCookieHeader(token) });
});