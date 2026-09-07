import { handle, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/server/auth/session.service";

export const GET = handle(async () => {
  const user = await getCurrentUser();
  return ok({ user });
});