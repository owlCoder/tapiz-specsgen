"use server";

import { requireAdmin } from "@/lib/guards";
import { settingsService } from "@/application/settings.service";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { AppSettings } from "@/features/specsgen/types/spec.types";

export async function getSettingsAction(): Promise<ActionResult<AppSettings>> {
  try {
    const user = await requireAdmin();
    const settings = await settingsService.getOrCreateFor(user.id);
    return ok(settings);
  } catch {
    return fail("Greška pri učitavanju postavki");
  }
}

export async function updateSettingsAction(data: AppSettings): Promise<ActionResult<AppSettings>> {
  try {
    const user = await requireAdmin();
    const settings = await settingsService.updateFor(user.id, data);
    return ok(settings);
  } catch {
    return fail("Greška pri čuvanju postavki");
  }
}
