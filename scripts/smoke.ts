import { coursesService } from "../src/application/courses.service";
import { settingsService } from "../src/application/settings.service";
import { archiveService } from "../src/application/archive.service";

async function main() {
  // 1. Settings
  const settings = await settingsService.getOrCreate();
  console.log("settings:", settings.faculty, settings.academicYear);

  // 2. Seed if empty
  await coursesService.seedIfEmpty();
  const courses = await coursesService.getAll();
  if (courses.length === 0) throw new Error("seed FAIL: no courses");
  console.log("courses:", courses.length, "—", courses[0].name);

  // 3. Create course
  const stamp = Date.now();
  const course = await coursesService.create({
    name: `Smoke predmet ${stamp}`,
    abbr: "SMK",
    yearOfStudy: 3,
    semester: 6,
    projectType: "timski",
    teamSize: 3,
    description: "",
    techStack: { jezik: "TS", backend: "Node", frontend: "React", baza: "MySQL", ostalo: "" },
    usesAgileBoard: false,
    agileTool: "",
    optionalCount: 0,
    varyByTeam: false,
    numTeams: 1,
    entityVarMin: 0,
    entityVarMax: 0,
    modules: [],
    scenarios: [],
    nonFunctional: [],
    deliverables: [],
    grading: [],
    notes: "",
  });
  console.log("course created:", course.id, course.name);

  // 4. Update
  const updated = await coursesService.update(course.id, { ...course, name: `Smoke predmet ${stamp} (izmenjen)` });
  if (!updated.name.includes("izmenjen")) throw new Error("update FAIL");
  console.log("update OK:", updated.name);

  // 5. Archive
  const entry = await archiveService.create({
    courseId: course.id,
    courseName: course.name,
    abbr: course.abbr,
    academicYear: settings.academicYear,
    faculty: settings.faculty,
    variants: [{ teamIndex: 0, code: "SMK-1000-1", scenario: "", markdown: "# Test" }],
  });
  console.log("archive created:", entry.id);

  const archive = await archiveService.getAll();
  if (!archive.some((a) => a.id === entry.id)) throw new Error("archive findAll FAIL");

  // 6. Cleanup
  await archiveService.delete(entry.id);
  await coursesService.delete(course.id);
  console.log("cleanup OK");

  console.log("SMOKE OK");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("SMOKE FAIL:", e);
    process.exit(1);
  });
