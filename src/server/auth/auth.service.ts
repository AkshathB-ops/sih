import { UserRole } from "@/generated/prisma/client";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateSessionToken, hashToken } from "@/lib/auth/session";
import { ConflictError, UnauthenticatedError } from "@/lib/errors";
import {
  createSession,
} from "@/repositories/session.repo";
import { createUser, findUserByEmail } from "@/repositories/user.repo";
import type { RegisterInput, LoginInput } from "@/validations/auth";
import { writeAuditLog } from "@/repositories/audit.repo";

export interface RegisterResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  token: string;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
    role: UserRole.CITIZEN,
    district: input.district,
  });

  const token = generateSessionToken();
  await createSession({ tokenHash: hashToken(token), userId: user.id });

  await writeAuditLog({
    userId: user.id,
    action: "user.register",
    entityType: "User",
    entityId: user.id,
    metadata: { role: user.role },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<RegisterResult> {
  const user = await findUserByEmail(input.email);
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new UnauthenticatedError("Invalid email or password");
  }

  const token = generateSessionToken();
  await createSession({ tokenHash: hashToken(token), userId: user.id });

  await writeAuditLog({
    userId: user.id,
    action: "user.login",
    entityType: "User",
    entityId: user.id,
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
}