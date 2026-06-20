import {
  index,
  int,
  json,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";
import type { Deliverable, GradingItem, Module, Scenario, TechStack } from "@/features/specgen/types/spec.types";

const id = () =>
  varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: id(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
  lmsSubjectId: varchar("lms_subject_id", { length: 64 }).unique(),
  universityId: int("university_id"),
  facultyId: int("faculty_id"),
  universityName: varchar("university_name", { length: 100 }),
  facultyName: varchar("faculty_name", { length: 100 }),
  authProvider: mysqlEnum("auth_provider", ["local", "tapiz-lms"]).notNull().default("local"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── Event log ────────────────────────────────────────────────────────────────

export const APP_EVENT_TYPES = [
  "course_created",
  "course_updated",
  "course_deleted",
  "archive_created",
  "archive_deleted",
  "settings_updated",
] as const;

export const appEvents = mysqlTable(
  "app_events",
  {
    id: id(),
    actorId: varchar("actor_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: mysqlEnum("type", APP_EVENT_TYPES).notNull(),
    detail: varchar("detail", { length: 500 }).notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ix_app_events_actor").on(t.actorId, t.createdAt)],
);

// ─── App Settings (singleton, id = '1') ───────────────────────────────────────

export const appSettings = mysqlTable("app_settings", {
  id: varchar("id", { length: 4 }).primaryKey().default("1"),
  faculty: varchar("faculty", { length: 255 }).notNull().default(""),
  academicYear: varchar("academic_year", { length: 20 }).notNull().default(""),
  integrityNote: tinyint("integrity_note").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = mysqlTable("courses", {
  id: id(),
  name: varchar("name", { length: 255 }).notNull(),
  abbr: varchar("abbr", { length: 20 }).notNull().default(""),
  yearOfStudy: int("year_of_study").notNull().default(3),
  semester: int("semester").notNull().default(6),
  projectType: mysqlEnum("project_type", ["timski", "individualni"]).notNull().default("timski"),
  teamSize: int("team_size").notNull().default(3),
  description: text("description"),
  techStack: json("tech_stack").notNull().$type<TechStack>(),
  usesAgileBoard: tinyint("uses_agile_board").notNull().default(0),
  agileTool: varchar("agile_tool", { length: 100 }).notNull().default(""),
  optionalCount: int("optional_count").notNull().default(3),
  varyByTeam: tinyint("vary_by_team").notNull().default(0),
  numTeams: int("num_teams").notNull().default(6),
  entityVarMin: int("entity_var_min").notNull().default(0),
  entityVarMax: int("entity_var_max").notNull().default(0),
  modules: json("modules").notNull().$type<Module[]>(),
  scenarios: json("scenarios").notNull().$type<Scenario[]>(),
  nonFunctional: json("non_functional").notNull().$type<string[]>(),
  deliverables: json("deliverables").notNull().$type<Deliverable[]>(),
  grading: json("grading").notNull().$type<GradingItem[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── Archive Entries ──────────────────────────────────────────────────────────

export const archiveEntries = mysqlTable(
  "archive_entries",
  {
    id: id(),
    courseId: varchar("course_id", { length: 36 }),
    courseName: varchar("course_name", { length: 255 }).notNull(),
    abbr: varchar("abbr", { length: 20 }).notNull().default(""),
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    faculty: varchar("faculty", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ix_archive_entries_year").on(t.academicYear)],
);

// ─── Archive Variants (per group/team) ───────────────────────────────────────

export const archiveVariants = mysqlTable(
  "archive_variants",
  {
    id: id(),
    entryId: varchar("entry_id", { length: 36 })
      .notNull()
      .references(() => archiveEntries.id, { onDelete: "cascade" }),
    teamIndex: int("team_index").notNull(),
    code: varchar("code", { length: 30 }).notNull(),
    scenarioName: varchar("scenario_name", { length: 255 }).notNull().default(""),
    markdown: longtext("markdown").notNull(),
  },
  (t) => [index("ix_archive_variants_entry").on(t.entryId)],
);
