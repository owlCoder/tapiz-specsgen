import { settingsRepo } from "@/infrastructure/repositories/settings.repo";
import { SEED_SETTINGS } from "@/features/specsgen/lib/seed";
import type { AppSettings } from "@/features/specsgen/types/spec.types";

export const settingsService = {
  async getOrCreateFor(ownerId: string): Promise<AppSettings> {
    return settingsRepo.getOrCreateFor(ownerId, SEED_SETTINGS);
  },

  async updateFor(ownerId: string, data: AppSettings): Promise<AppSettings> {
    return settingsRepo.updateFor(ownerId, data);
  },
};
