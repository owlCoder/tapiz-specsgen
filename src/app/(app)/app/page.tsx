import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guards";
import { coursesService } from "@/application/courses.service";
import { settingsService } from "@/application/settings.service";
import { archiveService } from "@/application/archive.service";
import { SEED_COURSES } from "@/features/specsgen/lib/seed";
import { SpecGenApp } from "@/features/specsgen";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect("/login");
  }

  const [settings, courses, archive] = await Promise.all([
    settingsService.getOrCreateFor(user.id),
    coursesService.getAllForUser(user.id),
    archiveService.getAllForUser(user.id),
  ]);

  // Javni read-only template-i (ODP/OIB/ERS) — vidljivi svima, iz koda (ne iz DB).
  const templateCourses = SEED_COURSES.map((c) => ({ ...c, id: `tpl:${c.abbr}` }));

  return (
    <SpecGenApp
      initialSettings={settings}
      initialCourses={courses}
      initialArchive={archive}
      templateCourses={templateCourses}
      user={{ name: user.name, id: user.id }}
    />
  );
}
