import { settingsRepo } from "@/infrastructure/repositories/settings.repo";
import { SEED_SETTINGS } from "@/features/specgen/lib/seed";
import type { AppSettings } from "@/features/specgen/types/spec.types";

export const settingsService = {
  async getOrCreate(): Promise<AppSettings> {
    return settingsRepo.getOrCreate(SEED_SETTINGS);
  },

  async update(data: AppSettings): Promise<AppSettings> {
    return settingsRepo.update(data);
  },
};
