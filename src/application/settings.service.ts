import { settingsRepo } from "@/infrastructure/repositories/settings.repo";
import { SEED_SETTINGS } from "@/features/specsgen/lib/seed";
import type { AppSettings } from "@/features/specsgen/types/spec.types";

export const settingsService = {
  async getOrCreate(): Promise<AppSettings> {
    return settingsRepo.getOrCreate(SEED_SETTINGS);
  },

  async update(data: AppSettings): Promise<AppSettings> {
    return settingsRepo.update(data);
  },
};
