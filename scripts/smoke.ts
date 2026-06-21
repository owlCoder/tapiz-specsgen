import { coursesService } from "../src/application/courses.service";
import { settingsService } from "../src/application/settings.service";
import { archiveService } from "../src/application/archive.service";
import { shareService } from "../src/application/share.service";
import { usersRepo } from "../src/infrastructure/repositories/users.repo";

async function main() {
  const stamp = Date.now();

  // 0. Dva test asistenta (owner + ko-asistent za share test).
  const owner = await usersRepo.create({
    firstName: "Smoke",
    lastName: "Owner",
    email: `smoke-owner-${stamp}@test.local`,
    passwordHash: "x",
    role: "admin",
  });
  const peer = await usersRepo.create({
    firstName: "Smoke",
    lastName: "Peer",
    email: `smoke-peer-${stamp}@test.local`,
    passwordHash: "x",
    role: "admin",
  });

  // 1. Settings (per-owner)
  const settings = await settingsService.getOrCreateFor(owner.id);
  console.log("settings:", settings.faculty, settings.academicYear);

  // 2. Iskoristi template → privatan kurs
  const fromTpl = await coursesService.createFromTemplate("ODP", owner.id);
  console.log("template copy:", fromTpl.id, fromTpl.name);

  // 3. Create course
  const course = await coursesService.create(
    {
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
    },
    owner.id,
  );
  console.log("course created:", course.id, course.name);

  // 4. Izolacija: peer još NE vidi ownerov kurs
  const peerBefore = await coursesService.getAllForUser(peer.id);
  if (peerBefore.some((c) => c.id === course.id)) throw new Error("ISOLATION FAIL");
  console.log("isolation OK: peer ne vidi tuđ kurs");

  // 5. Share po email-u → peer sad vidi kurs (kao "shared")
  await shareService.shareByEmail(course.id, peer.email);
  const peerAfter = await coursesService.getAllForUser(peer.id);
  const shared = peerAfter.find((c) => c.id === course.id);
  if (!shared || shared.access !== "shared") throw new Error("SHARE FAIL");
  console.log("share OK: peer vidi kurs kao", shared.access, "(od", shared.ownerName + ")");

  // 6. Update
  const updated = await coursesService.update(course.id, {
    ...course,
    name: `Smoke predmet ${stamp} (izmenjen)`,
  });
  if (!updated.name.includes("izmenjen")) throw new Error("update FAIL");
  console.log("update OK:", updated.name);

  // 7. Archive (per-owner)
  const entry = await archiveService.create(
    {
      courseId: course.id,
      courseName: course.name,
      abbr: course.abbr,
      academicYear: settings.academicYear,
      faculty: settings.faculty,
      variants: [{ teamIndex: 0, code: "SMK-1000-1", scenario: "", markdown: "# Test" }],
    },
    owner.id,
  );
  const archive = await archiveService.getAllForUser(owner.id);
  if (!archive.some((a) => a.id === entry.id)) throw new Error("archive findAllForUser FAIL");
  console.log("archive OK:", entry.id);

  // 8. Cleanup (kaskadno briše share/archive preko FK na users)
  await archiveService.delete(entry.id);
  await coursesService.delete(course.id);
  await coursesService.delete(fromTpl.id);
  console.log("cleanup OK");

  console.log("SMOKE OK");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("SMOKE FAIL:", e);
    process.exit(1);
  });
