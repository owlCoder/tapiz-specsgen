import type { AppSettings } from "@/features/specsgen/types/spec.types";

export interface ISettingsRepo {
  getOrCreate(defaults: AppSettings): Promise<AppSettings>;
  update(data: AppSettings): Promise<AppSettings>;
}
