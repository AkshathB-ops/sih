import { handle, ok } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { submitDraft } from "@/server/challenges/challenge.service";

export const POST = handle(async (_request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const challenge = await submitDraft(user, id);
  return ok(challenge);
});