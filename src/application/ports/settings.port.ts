import type { AppSettings } from "@/features/specsgen/types/spec.types";

export interface ISettingsRepo {
  getOrCreateFor(ownerId: string, defaults: AppSettings): Promise<AppSettings>;
  updateFor(ownerId: string, data: AppSettings): Promise<AppSettings>;
}
