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
  findAll(): Promise<ArchiveEntry[]>;
  create(data: NewArchiveEntry): Promise<ArchiveEntry>;
  delete(id: string): Promise<void>;
}
