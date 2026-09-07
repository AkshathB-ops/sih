import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { assignChallenge } from "@/server/challenges/challenge.service";
import { assignChallengeSchema } from "@/validations/challenge";

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(assignChallengeSchema, await readJson(request));
  const challenge = await assignChallenge(user, id, body);
  return ok(challenge);
});