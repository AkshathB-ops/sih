// Typed application errors with a stable machine-readable shape.
// Internal/database errors are never exposed to clients directly.

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You are not permitted to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, unknown>, message = "Invalid input") {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Operation conflicts with current state") {
    super(message, 409, "CONFLICT");
  }
}

// Converts a thrown value into an AppError (safe to return to clients).
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError("An unexpected error occurred", 500, "INTERNAL_ERROR");
  }
  return new AppError("An unexpected error occurred", 500, "INTERNAL_ERROR");
}