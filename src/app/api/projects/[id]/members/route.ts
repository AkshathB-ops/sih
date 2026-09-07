import { z } from "zod";

import { MemberRole } from "@/generated/prisma/client";

import { handle, ok, parse, readJson } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { addMemberToProject } from "@/server/projects/project.service";

const addMemberSchema = z.object({
  userId: z.string().min(1).max(100),
  role: z.nativeEnum(MemberRole),
  isLead: z.boolean().optional(),
});

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = parse(addMemberSchema, await readJson(request));
  await addMemberToProject(user, id, body);
  return ok({ added: true });
});