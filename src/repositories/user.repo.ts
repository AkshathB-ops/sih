import type { User, UserRole } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  district?: string | null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
      role: input.role,
      district: input.district ?? null,
    },
  });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}