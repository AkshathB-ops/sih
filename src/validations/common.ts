import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(100000).default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().min(1).max(100),
});

export const enumFromValues = <T extends string>(
  values: readonly T[],
  label: string,
) =>
  z.enum(values as [T, ...T[]], {
    error: () => `Invalid ${label}`,
  });

export const emailSchema = z.email({ error: () => "Invalid email address" });

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));