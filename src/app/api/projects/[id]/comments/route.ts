import { handle, ok } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { listForProject } from "@/server/comments/comment.service";

export const GET = handle(async (_request: Request, ctx) => {
  const { id } = await ctx.params;
  await requireUser();
  const comments = await listForProject(id);
  return ok({ comments });
});