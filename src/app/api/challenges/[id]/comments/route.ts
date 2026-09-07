import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { addComment, listForChallenge } from "@/server/comments/comment.service";
import { createCommentSchema } from "@/validations/project";

export const GET = handle(async (_request: Request, ctx) => {
  const { id } = await ctx.params;
  const comments = await listForChallenge(id);
  return ok({ comments });
});

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(createCommentSchema, await readJson(request));
  const comment = await addComment(user, {
    challengeId: id,
    projectId: body.projectId,
    content: body.content,
  });
  return ok({ comment }, 201);
});