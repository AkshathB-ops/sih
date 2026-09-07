import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { transitionChallenge } from "@/server/challenges/challenge.service";
import { transitionChallengeSchema } from "@/validations/challenge";

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(transitionChallengeSchema, await readJson(request));
  const challenge = await transitionChallenge(user, id, body);
  return ok(challenge);
});