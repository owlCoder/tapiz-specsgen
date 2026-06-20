import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { appSettings } from "@/infrastructure/db/schema";
import type { ISettingsRepo } from "@/application/ports/settings.port";
import type { AppSettings } from "@/features/specgen/types/spec.types";

function mapRow(row: typeof appSettings.$inferSelect): AppSettings {
  return {
    faculty: row.faculty,
    academicYear: row.academicYear,
    integrityNote: row.integrityNote === 1,
  };
}

export const settingsRepo: ISettingsRepo = {
  async getOrCreate(defaults: AppSettings) {
    const rows = await db.select().from(appSettings).where(eq(appSettings.id, "1"));
    if (rows.length > 0) return mapRow(rows[0]);
    await db.insert(appSettings).values({
      id: "1",
      faculty: defaults.faculty,
      academicYear: defaults.academicYear,
      integrityNote: defaults.integrityNote ? 1 : 0,
    });
    return defaults;
  },

  async update(data: AppSettings) {
    await db
      .update(appSettings)
      .set({
        faculty: data.faculty,
        academicYear: data.academicYear,
        integrityNote: data.integrityNote ? 1 : 0,
      })
      .where(eq(appSettings.id, "1"));
    return data;
  },
};
