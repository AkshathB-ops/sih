import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { reviewChallenge } from "@/server/challenges/challenge.service";
import { reviewChallengeSchema } from "@/validations/challenge";

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(reviewChallengeSchema, await readJson(request));
  const challenge = await reviewChallenge(user, id, body);
  return ok(challenge);
});