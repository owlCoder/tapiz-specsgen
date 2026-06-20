import { eq, count } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { courses } from "@/infrastructure/db/schema";
import type { ICoursesRepo } from "@/application/ports/courses.port";
import type { Course, CourseInput } from "@/features/specsgen/types/spec.types";

function toBoolean(val: number | null | undefined): boolean {
  return val === 1;
}

function mapRow(row: typeof courses.$inferSelect): Course {
  return {
    id: row.id,
    name: row.name,
    abbr: row.abbr,
    yearOfStudy: row.yearOfStudy,
    semester: row.semester,
    projectType: row.projectType,
    teamSize: row.teamSize,
    description: row.description ?? "",
    techStack: row.techStack,
    usesAgileBoard: toBoolean(row.usesAgileBoard),
    agileTool: row.agileTool,
    optionalCount: row.optionalCount,
    varyByTeam: toBoolean(row.varyByTeam),
    numTeams: row.numTeams,
    entityVarMin: row.entityVarMin,
    entityVarMax: row.entityVarMax,
    modules: row.modules,
    scenarios: row.scenarios,
    nonFunctional: row.nonFunctional,
    deliverables: row.deliverables,
    grading: row.grading,
    notes: row.notes ?? "",
  };
}

export const coursesRepo: ICoursesRepo = {
  async findAll() {
    const rows = await db.select().from(courses).orderBy(courses.createdAt);
    return rows.map(mapRow);
  },

  async count() {
    const [{ value }] = await db.select({ value: count() }).from(courses);
    return value;
  },

  async create(data: CourseInput) {
    const id = crypto.randomUUID();
    await db.insert(courses).values({
      id,
      name: data.name,
      abbr: data.abbr,
      yearOfStudy: data.yearOfStudy,
      semester: data.semester,
      projectType: data.projectType,
      teamSize: data.teamSize,
      description: data.description,
      techStack: data.techStack,
      usesAgileBoard: data.usesAgileBoard ? 1 : 0,
      agileTool: data.agileTool,
      optionalCount: data.optionalCount,
      varyByTeam: data.varyByTeam ? 1 : 0,
      numTeams: data.numTeams,
      entityVarMin: data.entityVarMin,
      entityVarMax: data.entityVarMax,
      modules: data.modules,
      scenarios: data.scenarios,
      nonFunctional: data.nonFunctional,
      deliverables: data.deliverables,
      grading: data.grading,
      notes: data.notes,
    });
    const [row] = await db.select().from(courses).where(eq(courses.id, id));
    return mapRow(row);
  },

  async update(id: string, data: Partial<CourseInput>) {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.abbr !== undefined) patch.abbr = data.abbr;
    if (data.yearOfStudy !== undefined) patch.yearOfStudy = data.yearOfStudy;
    if (data.semester !== undefined) patch.semester = data.semester;
    if (data.projectType !== undefined) patch.projectType = data.projectType;
    if (data.teamSize !== undefined) patch.teamSize = data.teamSize;
    if (data.description !== undefined) patch.description = data.description;
    if (data.techStack !== undefined) patch.techStack = data.techStack;
    if (data.usesAgileBoard !== undefined) patch.usesAgileBoard = data.usesAgileBoard ? 1 : 0;
    if (data.agileTool !== undefined) patch.agileTool = data.agileTool;
    if (data.optionalCount !== undefined) patch.optionalCount = data.optionalCount;
    if (data.varyByTeam !== undefined) patch.varyByTeam = data.varyByTeam ? 1 : 0;
    if (data.numTeams !== undefined) patch.numTeams = data.numTeams;
    if (data.entityVarMin !== undefined) patch.entityVarMin = data.entityVarMin;
    if (data.entityVarMax !== undefined) patch.entityVarMax = data.entityVarMax;
    if (data.modules !== undefined) patch.modules = data.modules;
    if (data.scenarios !== undefined) patch.scenarios = data.scenarios;
    if (data.nonFunctional !== undefined) patch.nonFunctional = data.nonFunctional;
    if (data.deliverables !== undefined) patch.deliverables = data.deliverables;
    if (data.grading !== undefined) patch.grading = data.grading;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (Object.keys(patch).length === 0) {
      const [row] = await db.select().from(courses).where(eq(courses.id, id));
      return row ? mapRow(row) : null;
    }
    await db.update(courses).set(patch).where(eq(courses.id, id));
    const [row] = await db.select().from(courses).where(eq(courses.id, id));
    return row ? mapRow(row) : null;
  },

  async delete(id: string) {
    await db.delete(courses).where(eq(courses.id, id));
  },

  async insertMany(data: CourseInput[]) {
    for (const d of data) {
      await coursesRepo.create(d);
    }
  },
};
