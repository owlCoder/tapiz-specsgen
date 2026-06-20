import type { AppSettings, Course, Entitet, Module, ResolvedEntitet, ResolvedVariant, Scenario } from "../types/spec.types";

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resolveEntities(
  scenario: Scenario | null,
  rng: () => number,
  eMin: number,
  eMax: number,
): ResolvedEntitet[] {
  if (!scenario?.entiteti?.length) return [];
  const core = scenario.entiteti.filter((e: Entitet) => !e.optional);
  const opt = scenario.entiteti.filter((e: Entitet) => e.optional);
  let count = 0;
  if (opt.length) {
    const lo = Math.min(eMin || 0, opt.length);
    const hi = Math.min(eMax || 0, opt.length);
    count = lo + Math.floor(rng() * (Math.max(0, hi - lo) + 1));
  }
  const picked = seededShuffle(opt, rng).slice(0, count);
  return [...core, ...picked].map((e: Entitet) => {
    const coreA = e.atributi.filter((a) => !a.optional);
    const optA = e.atributi.filter((a) => a.optional).filter(() => rng() > 0.5);
    return { naziv: e.naziv, atributi: [...coreA, ...optA] };
  });
}

export function buildVariant(
  course: Course,
  settings: AppSettings,
  teamIndex: number,
): ResolvedVariant {
  const yearSeed = hashStr(settings.academicYear + "|" + (course.abbr || course.name));
  const scenarios = course.scenarios || [];
  const scenario = scenarios.length
    ? scenarios[(yearSeed + teamIndex) % scenarios.length]
    : null;
  const rng = mulberry32(
    hashStr(
      settings.academicYear +
        "|" +
        (course.abbr || course.name) +
        "|" +
        teamIndex,
    ),
  );
  const mandatory = (course.modules || []).filter((m: Module) => m.mandatory);
  const optional = (course.modules || []).filter((m: Module) => !m.mandatory);
  const k = Math.min(course.optionalCount || 0, optional.length);
  const picked = seededShuffle(optional, rng).slice(0, k);
  const modules = [...mandatory, ...picked];
  const entities = resolveEntities(
    scenario ?? null,
    rng,
    course.entityVarMin,
    course.entityVarMax,
  );
  const code =
    (course.abbr || "X").toUpperCase().slice(0, 3) +
    "-" +
    ((yearSeed % 9000) + 1000) +
    "-" +
    (teamIndex + 1);
  return { scenario: scenario ?? null, entities, modules, teamIndex, code };
}

export function generateMarkdown(
  c: Course,
  s: AppSettings,
  v: ResolvedVariant,
): string {
  const L: string[] = [];
  L.push(`# ${c.name}${c.abbr ? ` (${c.abbr})` : ""}`);
  L.push(`## Specifikacija projektnog zadatka`);
  L.push("");
  L.push(`**Školska godina:** ${s.academicYear}  `);
  L.push(`**${s.faculty}**  `);
  L.push(
    `**Godina studija:** ${c.yearOfStudy}. godina, ${c.semester}. semestar  `,
  );
  L.push(
    `**Tip projekta:** ${c.projectType === "timski" ? `timski (tim do ${c.teamSize} člana)` : "individualni"}  `,
  );
  if (c.varyByTeam) L.push(`**Grupa:** ${v.teamIndex + 1}  `);
  L.push(`**Oznaka varijante:** \`${v.code}\``);
  L.push("");
  L.push(`## 1. Opis projekta`);
  L.push(
    c.description?.trim() ||
      `Razvija se aplikacija na temu: **${v.scenario ? v.scenario.naziv : "zadatu temu"}**.${v.scenario?.opis ? " " + v.scenario.opis : ""}`,
  );
  L.push("");
  L.push(`## 2. Tehnološki stack`);
  L.push("| Komponenta | Tehnologija |");
  L.push("| --- | --- |");
  (
    [
      ["Programski jezik", c.techStack.jezik],
      ["Backend", c.techStack.backend],
      ["Frontend", c.techStack.frontend],
      ["Baza", c.techStack.baza],
      ["Ostalo", c.techStack.ostalo],
    ] as [string, string][]
  )
    .filter(([, x]) => x && x.trim() && x.trim() !== "—")
    .forEach(([k, x]) => L.push(`| ${k} | ${x} |`));
  L.push("");
  L.push(`## 3. Metodologija rada`);
  L.push(
    c.usesAgileBoard
      ? `Agile metodologija uz obaveznu Agile tablu (**${c.agileTool || "Agile board"}**): sprintovi, user stories, raspodela i praćenje zadataka.`
      : `Fazni razvoj uz jasnu raspodelu odgovornosti i poštovanje rokova.`,
  );
  L.push("");
  L.push(`## 4. Domenski model`);
  if (v.entities?.length)
    v.entities.forEach((e) =>
      L.push(
        `**${e.naziv}** — ${e.atributi.map((a) => `${a.naziv}: ${a.tip}`).join(", ")}`,
      ),
    );
  else L.push("_Entiteti nisu definisani._");
  L.push("");
  L.push(`## 5. Funkcionalni zahtevi`);
  L.push(
    `Obavezna je potpuna **CRUD** funkcionalnost (Create, Read, Update, Delete) nad svim entitetima domena, uz validaciju ulaza. Pored toga, sistem mora implementirati:`,
  );
  L.push("");
  v.modules.forEach((m, i) => {
    L.push(
      `**5.${i + 1} ${m.naziv}**${m.mandatory ? "" : " *(izborni)*"}`,
    );
    if (m.opis) L.push(m.opis);
    L.push("");
  });
  if (c.nonFunctional?.length) {
    L.push(`## 6. Nefunkcionalni zahtevi`);
    c.nonFunctional.forEach((n) => L.push(`- ${n}`));
    L.push("");
  }
  if (c.deliverables?.length) {
    L.push(`## 7. Predaja i rokovi`);
    L.push("| Stavka | Rok |");
    L.push("| --- | --- |");
    c.deliverables.forEach((d) => L.push(`| ${d.naziv} | ${d.rok} |`));
    L.push("");
  }
  if (c.grading?.length) {
    L.push(`## 8. Kriterijumi ocenjivanja`);
    L.push("| Stavka | Poeni |");
    L.push("| --- | --- |");
    let sum = 0;
    c.grading.forEach((g) => {
      sum += +g.poeni || 0;
      L.push(`| ${g.stavka} | ${g.poeni} |`);
    });
    L.push(`| **Ukupno** | **${sum}** |`);
    L.push("");
  }
  if (s.integrityNote) {
    L.push(`## 9. Akademska čestitost`);
    L.push(
      `Svaka grupa i generacija dobija jedinstvenu varijantu (\`${v.code}\`) sa različitim domenom i skupom zahteva. Preuzimanje ranijih ili tuđih rešenja je uočljivo i tretira se kao prepisivanje.`,
    );
    L.push("");
  }
  if (c.notes?.trim()) {
    L.push(`## 10. Napomene`);
    L.push(c.notes.trim());
  }
  return L.join("\n");
}
