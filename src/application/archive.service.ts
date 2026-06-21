import { archiveRepo } from "@/infrastructure/repositories/archive.repo";
import type { ArchiveEntry } from "@/features/specsgen/types/spec.types";
import type { NewArchiveEntry } from "@/application/ports/archive.port";

export const archiveService = {
  async getAllForUser(userId: string): Promise<ArchiveEntry[]> {
    return archiveRepo.findAllForUser(userId);
  },

  async create(data: NewArchiveEntry, ownerId: string): Promise<ArchiveEntry> {
    return archiveRepo.create(data, ownerId);
  },

  async findOwnerId(id: string): Promise<string | null> {
    return archiveRepo.findOwnerId(id);
  },

  async delete(id: string): Promise<void> {
    return archiveRepo.delete(id);
  },
};
