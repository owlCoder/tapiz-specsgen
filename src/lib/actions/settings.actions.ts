"use server";

import { requireAdmin } from "@/lib/guards";
import { settingsService } from "@/application/settings.service";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { AppSettings } from "@/features/specgen/types/spec.types";

export async function getSettingsAction(): Promise<ActionResult<AppSettings>> {
  try {
    await requireAdmin();
    const settings = await settingsService.getOrCreate();
    return ok(settings);
  } catch {
    return fail("Greška pri učitavanju postavki");
  }
}

export async function updateSettingsAction(data: AppSettings): Promise<ActionResult<AppSettings>> {
  try {
    await requireAdmin();
    const settings = await settingsService.update(data);
    return ok(settings);
  } catch {
    return fail("Greška pri čuvanju postavki");
  }
}
