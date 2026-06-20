import { archiveRepo } from "@/infrastructure/repositories/archive.repo";
import type { ArchiveEntry } from "@/features/specsgen/types/spec.types";
import type { NewArchiveEntry } from "@/application/ports/archive.port";

export const archiveService = {
  async getAll(): Promise<ArchiveEntry[]> {
    return archiveRepo.findAll();
  },

  async create(data: NewArchiveEntry): Promise<ArchiveEntry> {
    return archiveRepo.create(data);
  },

  async delete(id: string): Promise<void> {
    return archiveRepo.delete(id);
  },
};
