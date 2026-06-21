"use server";

import { requireAdmin, UnauthorizedError } from "@/lib/guards";
import { archiveService } from "@/application/archive.service";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { ArchiveEntry } from "@/features/specsgen/types/spec.types";
import type { NewArchiveEntry } from "@/application/ports/archive.port";

export async function getArchiveAction(): Promise<ActionResult<ArchiveEntry[]>> {
  try {
    const user = await requireAdmin();
    const archive = await archiveService.getAllForUser(user.id);
    return ok(archive);
  } catch {
    return fail("Greška pri učitavanju arhive");
  }
}

export async function createArchiveEntryAction(data: NewArchiveEntry): Promise<ActionResult<ArchiveEntry>> {
  try {
    const user = await requireAdmin();
    const entry = await archiveService.create(data, user.id);
    return ok(entry);
  } catch {
    return fail("Greška pri arhiviranju");
  }
}

export async function deleteArchiveEntryAction(id: string): Promise<ActionResult<void>> {
  try {
    const user = await requireAdmin();
    const ownerId = await archiveService.findOwnerId(id);
    if (ownerId !== user.id) throw new UnauthorizedError();
    await archiveService.delete(id);
    return ok(undefined);
  } catch {
    return fail("Greška pri brisanju iz arhive");
  }
}
