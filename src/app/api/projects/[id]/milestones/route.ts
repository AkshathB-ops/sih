import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { addMilestoneToProject } from "@/server/projects/project.service";
import { createMilestoneSchema } from "@/validations/project";

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(createMilestoneSchema, await readJson(request));
  const milestone = await addMilestoneToProject(user, id, body);
  return ok({ milestone }, 201);
});