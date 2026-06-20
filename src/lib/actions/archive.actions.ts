"use server";

import { requireAdmin } from "@/lib/guards";
import { archiveService } from "@/application/archive.service";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { ArchiveEntry } from "@/features/specsgen/types/spec.types";
import type { NewArchiveEntry } from "@/application/ports/archive.port";

export async function getArchiveAction(): Promise<ActionResult<ArchiveEntry[]>> {
  try {
    await requireAdmin();
    const archive = await archiveService.getAll();
    return ok(archive);
  } catch {
    return fail("Greška pri učitavanju arhive");
  }
}

export async function createArchiveEntryAction(data: NewArchiveEntry): Promise<ActionResult<ArchiveEntry>> {
  try {
    await requireAdmin();
    const entry = await archiveService.create(data);
    return ok(entry);
  } catch {
    return fail("Greška pri arhiviranju");
  }
}

export async function deleteArchiveEntryAction(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await archiveService.delete(id);
    return ok(undefined);
  } catch {
    return fail("Greška pri brisanju iz arhive");
  }
}
