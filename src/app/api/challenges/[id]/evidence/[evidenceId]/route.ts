import { handle, ok } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { removeEvidence } from "@/server/challenges/challenge.service";

export const DELETE = handle(async (_request: Request, ctx) => {
  const { id, evidenceId } = await ctx.params;
  const user = await requireUser();
  await removeEvidence(user, id, evidenceId);
  return ok({ deleted: true });
});