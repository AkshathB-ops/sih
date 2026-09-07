import { handle, ok } from "@/lib/api/response";
import { requireUser } from "@/server/auth/session.service";
import { uploadEvidence } from "@/server/challenges/challenge.service";

export const POST = handle(async (request: Request, ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return ok({ error: { message: "Invalid multipart form" } }, 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return ok({ error: { message: "Missing file field" } }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const evidence = await uploadEvidence(user, id, {
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: buffer.byteLength,
    data: buffer,
  });

  return ok({ evidence }, 201);
});