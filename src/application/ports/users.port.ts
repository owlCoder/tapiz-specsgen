import type { Role, UserDto } from "@/domain/types";

export interface UserRecord extends UserDto {
  passwordHash: string;
}

export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  lmsSubjectId?: string | null;
  authProvider?: "local" | "tapiz-lms";
  universityId?: number | null;
  facultyId?: number | null;
  universityName?: string | null;
  facultyName?: string | null;
}

export interface UsersRepo {
  findById(id: string): Promise<UserDto | null>;
  findRecordById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByLmsSubjectId(lmsSubjectId: string): Promise<UserDto | null>;
  getLmsSubjectId(userId: string): Promise<string | null>;
  create(user: NewUser): Promise<UserDto>;
  update(id: string, patch: Partial<NewUser>): Promise<void>;
}
