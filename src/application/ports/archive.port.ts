import type { ArchiveEntry, ArchiveVariant } from "@/features/specsgen/types/spec.types";

export interface NewArchiveEntry {
  courseId: string | null;
  courseName: string;
  abbr: string;
  academicYear: string;
  faculty: string;
  variants: Omit<ArchiveVariant, never>[];
}

export interface IArchiveRepo {
  findAllForUser(userId: string): Promise<ArchiveEntry[]>;
  create(data: NewArchiveEntry, ownerId: string): Promise<ArchiveEntry>;
  findOwnerId(id: string): Promise<string | null>;
  delete(id: string): Promise<void>;
}
