import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guards";
import { coursesService } from "@/application/courses.service";
import { settingsService } from "@/application/settings.service";
import { archiveService } from "@/application/archive.service";
import { SpecGenApp } from "@/features/specgen";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect("/login");
  }

  const [settings, courses, archive] = await Promise.all([
    settingsService.getOrCreate(),
    coursesService.getAll(),
    archiveService.getAll(),
  ]);

  return (
    <SpecGenApp
      initialSettings={settings}
      initialCourses={courses}
      initialArchive={archive}
      user={{ name: user.name, id: user.id }}
    />
  );
}
