import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import {
  createProjectForUser,
  listProjectsForUser,
} from "@/server/projects/project.service";
import { createProjectSchema } from "@/validations/project";

export const GET = handle(async (_request: Request) => {
  const user = await requireUser();
  const result = await listProjectsForUser(user);
  return ok(result);
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const body = parse(createProjectSchema, await readJson(request));
  const project = await createProjectForUser(user, body);
  return ok(project, 201);
});