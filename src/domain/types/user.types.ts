export type Role = "admin" | "user";

export type AuthProvider = "local" | "tapiz-lms";

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  authProvider: AuthProvider;
  /** LMS pripadnost — NULL za samostalne naloge. */
  universityId: number | null;
  facultyId: number | null;
  universityName: string | null;
  facultyName: string | null;
}

export function fullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}
