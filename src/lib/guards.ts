import { auth } from "@/lib/auth";
import type { Role } from "@/domain/types";

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
}

export class UnauthorizedError extends Error {
  constructor(message = "Nemate dozvolu za ovu akciju") {
    super(message);
  }
}

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError("Niste prijavljeni");
  return {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name ?? "",
  };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new UnauthorizedError();
  return user;
}
