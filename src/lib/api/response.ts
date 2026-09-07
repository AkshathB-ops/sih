import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

import { AppError, toAppError, ValidationError } from "@/lib/errors";

export function ok<T>(data: T, status = 200, headers?: HeadersInit): NextResponse {
  return NextResponse.json({ data }, { status, headers });
}

export function fail(error: unknown): NextResponse {
  const appError = toAppError(error);
  return NextResponse.json(
    {
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details ?? undefined,
      },
    },
    { status: appError.statusCode },
  );
}

// Validates `body` against a Zod schema, throwing a safe ValidationError.
export function parse<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const flattened = result.error.flatten();
    throw new ValidationError({ fieldErrors: flattened.fieldErrors });
  }
  return result.data;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError({ fieldErrors: { body: ["Request body must be valid JSON"] } });
  }
}

// Wraps a route handler so thrown AppErrors become structured JSON responses.
export function handle(
  fn: (request: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
  return async (request: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      return await fn(request, ctx);
    } catch (error) {
      if (process.env.NODE_ENV !== "test" && !(error instanceof AppError)) {
        console.error("[api] unhandled error", error instanceof Error ? error.stack : error);
      }
      return fail(error);
    }
  };
}