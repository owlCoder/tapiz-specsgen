import { auth } from "@/lib/auth";
import type { Role } from "@/domain/types";
import { coursesRepo, courseShareRepo } from "@/infrastructure/repositories/courses.repo";

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

/**
 * Pristup kursu za čitanje/edit/generisanje: owner ILI ko-asistent kome je
 * kurs podeljen. Baca ako kurs ne postoji ili user nema pristup.
 */
export async function requireCourseAccess(courseId: string): Promise<SessionUser> {
  const user = await requireAdmin();
  const ownerId = await coursesRepo.findOwnerId(courseId);
  if (!ownerId) throw new UnauthorizedError("Predmet ne postoji");
  if (ownerId === user.id) return user;
  if (await courseShareRepo.isSharedWith(courseId, user.id)) return user;
  throw new UnauthorizedError("Nemate pristup ovom predmetu");
}

/**
 * Samo vlasnik kursa — brisanje i upravljanje deljenjem (share/unshare).
 */
export async function requireCourseOwner(courseId: string): Promise<SessionUser> {
  const user = await requireAdmin();
  const ownerId = await coursesRepo.findOwnerId(courseId);
  if (!ownerId) throw new UnauthorizedError("Predmet ne postoji");
  if (ownerId !== user.id) throw new UnauthorizedError("Samo vlasnik može ovu akciju");
  return user;
}
