import { and, count, eq, or, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { courseAssistants, courses, users } from "@/infrastructure/db/schema";
import type { ICourseShareRepo, ICoursesRepo } from "@/application/ports/courses.port";
import type { Course, CourseInput } from "@/features/specsgen/types/spec.types";

function toBoolean(val: number | null | undefined): boolean {
  return val === 1;
}

function mapRow(row: typeof courses.$inferSelect): Course {
  return {
    id: row.id,
    ownerId: row.ownerId,
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

function insertValues(id: string, data: CourseInput, ownerId: string) {
  return {
    id,
    ownerId,
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
  };
}

export const coursesRepo: ICoursesRepo = {
  async findAllForUser(userId: string) {
    // Kursevi koje user poseduje ILI mu je neko podelio. Join na users za ime
    // vlasnika (prikaz "Od: X" na podeljenim kursevima).
    const rows = await db
      .select({
        course: courses,
        ownerFirst: users.firstName,
        ownerLast: users.lastName,
      })
      .from(courses)
      .innerJoin(users, eq(users.id, courses.ownerId))
      .leftJoin(
        courseAssistants,
        and(eq(courseAssistants.courseId, courses.id), eq(courseAssistants.userId, userId)),
      )
      .where(or(eq(courses.ownerId, userId), eq(courseAssistants.userId, userId)))
      .orderBy(courses.createdAt);

    return rows.map(({ course, ownerFirst, ownerLast }) => ({
      ...mapRow(course),
      access: course.ownerId === userId ? ("owner" as const) : ("shared" as const),
      ownerName: `${ownerFirst} ${ownerLast}`.trim(),
    }));
  },

  async findById(id: string) {
    const [row] = await db.select().from(courses).where(eq(courses.id, id));
    return row ? mapRow(row) : null;
  },

  async findOwnerId(id: string) {
    const [row] = await db
      .select({ ownerId: courses.ownerId })
      .from(courses)
      .where(eq(courses.id, id));
    return row?.ownerId ?? null;
  },

  async count() {
    const [{ value }] = await db.select({ value: count() }).from(courses);
    return value;
  },

  async create(data: CourseInput, ownerId: string) {
    const id = crypto.randomUUID();
    await db.insert(courses).values(insertValues(id, data, ownerId));
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
};

export const courseShareRepo: ICourseShareRepo = {
  async listAssistants(courseId: string) {
    const rows = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(courseAssistants)
      .innerJoin(users, eq(users.id, courseAssistants.userId))
      .where(eq(courseAssistants.courseId, courseId))
      .orderBy(courseAssistants.createdAt);
    return rows.map((r) => ({
      userId: r.userId,
      name: `${r.firstName} ${r.lastName}`.trim(),
      email: r.email,
    }));
  },

  async add(courseId: string, userId: string) {
    // Idempotentno — unique(courseId,userId) sprečava duplikate.
    await db
      .insert(courseAssistants)
      .values({ id: crypto.randomUUID(), courseId, userId })
      .onDuplicateKeyUpdate({ set: { courseId: sql`course_id` } });
  },

  async remove(courseId: string, userId: string) {
    await db
      .delete(courseAssistants)
      .where(and(eq(courseAssistants.courseId, courseId), eq(courseAssistants.userId, userId)));
  },

  async isSharedWith(courseId: string, userId: string) {
    const rows = await db
      .select({ id: courseAssistants.id })
      .from(courseAssistants)
      .where(and(eq(courseAssistants.courseId, courseId), eq(courseAssistants.userId, userId)))
      .limit(1);
    return rows.length > 0;
  },
};
