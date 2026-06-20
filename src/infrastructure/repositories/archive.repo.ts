import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { archiveEntries, archiveVariants } from "@/infrastructure/db/schema";
import type { IArchiveRepo, NewArchiveEntry } from "@/application/ports/archive.port";
import type { ArchiveEntry } from "@/features/specsgen/types/spec.types";

export const archiveRepo: IArchiveRepo = {
  async findAll() {
    const entries = await db
      .select()
      .from(archiveEntries)
      .orderBy(archiveEntries.createdAt);
    const result: ArchiveEntry[] = [];
    for (const entry of entries) {
      const variants = await db
        .select()
        .from(archiveVariants)
        .where(eq(archiveVariants.entryId, entry.id))
        .orderBy(archiveVariants.teamIndex);
      result.push({
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
      });
    }
    return result.reverse();
  },

  async create(data: NewArchiveEntry) {
    const id = crypto.randomUUID();
    await db.insert(archiveEntries).values({
      id,
      courseId: data.courseId ?? undefined,
      courseName: data.courseName,
      abbr: data.abbr,
      academicYear: data.academicYear,
      faculty: data.faculty,
    });
    for (const v of data.variants) {
      await db.insert(archiveVariants).values({
        id: crypto.randomUUID(),
        entryId: id,
        teamIndex: v.teamIndex,
        code: v.code,
        scenarioName: v.scenario,
        markdown: v.markdown,
      });
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

  async delete(id: string) {
    await db.delete(archiveEntries).where(eq(archiveEntries.id, id));
  },
};
