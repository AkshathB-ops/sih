import { handle, ok, parse, readJson } from "@/lib/api/response";
import { getCurrentUser, requireUser } from "@/server/auth/session.service";
import {
  getChallengeFor,
  updateChallengeForUser,
} from "@/server/challenges/challenge.service";
import { updateChallengeSchema } from "@/validations/challenge";

export const GET = handle(async (_request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const result = await getChallengeFor(user, id);
  return ok(result);
});

export const PATCH = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(updateChallengeSchema, await readJson(request));
  const challenge = await updateChallengeForUser(user, id, body);
  return ok(challenge);
});