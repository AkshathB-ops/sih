import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import {
  expressIndustryInterest,
  listInterestForUser,
} from "@/server/industry/industry.service";
import { industryInterestSchema } from "@/validations/project";

export const GET = handle(async (_request: Request) => {
  const user = await requireUser();
  const collaborations = await listInterestForUser(user);
  return ok({ collaborations });
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const body = parse(industryInterestSchema, await readJson(request));
  const collaboration = await expressIndustryInterest(user, body);
  return ok({ collaboration }, 201);
});