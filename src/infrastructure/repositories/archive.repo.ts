import { eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { archiveEntries, archiveVariants } from "@/infrastructure/db/schema";
import type { IArchiveRepo, NewArchiveEntry } from "@/application/ports/archive.port";
import type { ArchiveEntry } from "@/features/specsgen/types/spec.types";

export const archiveRepo: IArchiveRepo = {
  async findAllForUser(userId: string) {
    const entries = await db
      .select()
      .from(archiveEntries)
      .where(eq(archiveEntries.ownerId, userId))
      .orderBy(archiveEntries.createdAt);

    if (entries.length === 0) return [];

    const allVariants = await db
      .select()
      .from(archiveVariants)
      .where(inArray(archiveVariants.entryId, entries.map((e) => e.id)))
      .orderBy(archiveVariants.teamIndex);

    const variantsByEntry = new Map<string, typeof allVariants>();
    for (const v of allVariants) {
      const bucket = variantsByEntry.get(v.entryId);
      if (bucket) bucket.push(v);
      else variantsByEntry.set(v.entryId, [v]);
    }

    const result: ArchiveEntry[] = entries.map((entry) => ({
      id: entry.id,
      courseId: entry.courseId ?? null,
      courseName: entry.courseName,
      abbr: entry.abbr,
      academicYear: entry.academicYear,
      faculty: entry.faculty,
      createdAt: entry.createdAt.toISOString(),
      variants: (variantsByEntry.get(entry.id) ?? []).map((v) => ({
        teamIndex: v.teamIndex,
        code: v.code,
        scenario: v.scenarioName,
        markdown: v.markdown,
      })),
    }));
    return result.reverse();
  },

  async create(data: NewArchiveEntry, ownerId: string) {
    const id = crypto.randomUUID();
    await db.insert(archiveEntries).values({
      id,
      ownerId,
      courseId: data.courseId ?? undefined,
      courseName: data.courseName,
      abbr: data.abbr,
      academicYear: data.academicYear,
      faculty: data.faculty,
    });
    if (data.variants.length > 0) {
      await db.insert(archiveVariants).values(
        data.variants.map((v) => ({
          id: crypto.randomUUID(),
          entryId: id,
          teamIndex: v.teamIndex,
          code: v.code,
          scenarioName: v.scenario,
          markdown: v.markdown,
        })),
      );
    }
    const [entry] = await db
      .select()
      .from(archiveEntries)
      .where(eq(archiveEntries.id, id));
    const variants = await db
      .select()
      .from(archiveVariants)
      .where(eq(archiveVariants.entryId, id))
      .orderBy(archiveVariants.teamIndex);
    return {
      id: entry.id,
      courseId: entry.courseId ?? null,
      courseName: entry.courseName,
      abbr: entry.abbr,
      academicYear: entry.academicYear,
      faculty: entry.faculty,
      createdAt: entry.createdAt.toISOString(),
      variants: variants.map((v) => ({
        teamIndex: v.teamIndex,
        code: v.code,
        scenario: v.scenarioName,
        markdown: v.markdown,
      })),
    };
  },

  async findOwnerId(id: string) {
    const [row] = await db
      .select({ ownerId: archiveEntries.ownerId })
      .from(archiveEntries)
      .where(eq(archiveEntries.id, id));
    return row?.ownerId ?? null;
  },

  async delete(id: string) {
    await db.delete(archiveEntries).where(eq(archiveEntries.id, id));
  },
};
