import type { AppSettings } from "@/features/specgen/types/spec.types";

export interface ISettingsRepo {
  getOrCreate(defaults: AppSettings): Promise<AppSettings>;
  update(data: AppSettings): Promise<AppSettings>;
}
