import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { users } from "@/infrastructure/db/schema";
import type { NewUser, UserRecord, UsersRepo } from "@/application/ports";
import type { UserDto } from "@/domain/types";

const dtoColumns = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  role: users.role,
  authProvider: users.authProvider,
  universityId: users.universityId,
  facultyId: users.facultyId,
  universityName: users.universityName,
  facultyName: users.facultyName,
};

export const usersRepo: UsersRepo = {
  async findById(id: string): Promise<UserDto | null> {
    const rows = await db.select(dtoColumns).from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async findRecordById(id: string): Promise<UserRecord | null> {
    const rows = await db
      .select({ ...dtoColumns, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    const rows = await db
      .select({ ...dtoColumns, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows[0] ?? null;
  },

  async findByLmsSubjectId(lmsSubjectId: string): Promise<UserDto | null> {
    const rows = await db
      .select(dtoColumns)
      .from(users)
      .where(eq(users.lmsSubjectId, lmsSubjectId))
      .limit(1);
    return rows[0] ?? null;
  },

  async getLmsSubjectId(userId: string): Promise<string | null> {
    const rows = await db
      .select({ lmsSubjectId: users.lmsSubjectId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return rows[0]?.lmsSubjectId ?? null;
  },

  async create(user: NewUser): Promise<UserDto> {
    const id = crypto.randomUUID();
    await db.insert(users).values({ ...user, id });
    return {
      id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider ?? "local",
      universityId: user.universityId ?? null,
      facultyId: user.facultyId ?? null,
      universityName: user.universityName ?? null,
      facultyName: user.facultyName ?? null,
    };
  },

  async update(id: string, patch: Partial<NewUser>): Promise<void> {
    await db.update(users).set(patch).where(eq(users.id, id));
  },
};
