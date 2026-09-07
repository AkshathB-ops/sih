import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { getProjectFor } from "@/server/projects/project.service";
import { addComment } from "@/server/comments/comment.service";
import { createCommentSchema } from "@/validations/project";

export const GET = handle(async (_request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const project = await getProjectFor(user, id);
  return ok(project);
});

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(createCommentSchema, await readJson(request));
  const comment = await addComment(user, {
    challengeId: body.challengeId,
    projectId: id,
    content: body.content,
  });
  return ok({ comment }, 201);
});