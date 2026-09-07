import { handle, ok, parse, readJson } from "@/lib/api/response";
import { getCurrentUser, requireUser } from "@/server/auth/session.service";
import { createChallengeForUser, listChallengesFor } from "@/server/challenges/challenge.service";
import { challengeQuerySchema, createChallengeSchema } from "@/validations/challenge";

export const GET = handle(async (request: Request) => {
  const search = new URL(request.url).searchParams;
  const params = parse(
    challengeQuerySchema,
    Object.fromEntries(search.entries()),
  );
  const user = await getCurrentUser();

  const result = await listChallengesFor(user, {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    status: params.status,
    district: params.district,
    domain: params.domain,
    priority: params.priority,
    search: params.search,
    assignedTo: params.assignedTo,
  });

  return ok(result);
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const body = parse(createChallengeSchema, await readJson(request));
  const challenge = await createChallengeForUser(user, body);
  return ok(challenge, 201);
});