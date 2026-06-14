import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

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
  /** LMS `sub` — NULL za samostalne (lokalno registrovane) naloge. */
  lmsSubjectId: varchar("lms_subject_id", { length: 64 }).unique(),
  /** LMS uni/faculty metadata — osvežavaju se pri svakoj SSO prijavi. */
  universityId: int("university_id"),
  facultyId: int("faculty_id"),
  universityName: varchar("university_name", { length: 100 }),
  facultyName: varchar("faculty_name", { length: 100 }),
  authProvider: mysqlEnum("auth_provider", ["local", "tapiz-lms"]).notNull().default("local"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── Demo entitet: Item ───────────────────────────────────────────────────────
//
// "Item" je živi primer čitavog stack-a (schema → repo → servis → akcija →
// feature view → i18n). Preimenuj u entitet svog proizvoda i proširi polja.

export const items = mysqlTable(
  "items",
  {
    id: id(),
    ownerId: varchar("owner_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["active", "done", "archived"]).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("ix_items_owner").on(t.ownerId)],
);

// ─── Event log ────────────────────────────────────────────────────────────────
//
// Šablon po uzoru na tapiz-boards team_events: type enum + detail snapshot.
// Upisuje se iz akcija preko eventsService.log (nikad ne baca).

export const APP_EVENT_TYPES = [
  "item_created",
  "item_updated",
  "item_deleted",
  "item_status_changed",
] as const;

export const appEvents = mysqlTable(
  "app_events",
  {
    id: id(),
    actorId: varchar("actor_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: mysqlEnum("type", APP_EVENT_TYPES).notNull(),
    /** Snapshot konteksta (naslov itema...) — preživi brisanje izvora. */
    detail: varchar("detail", { length: 500 }).notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ix_app_events_actor").on(t.actorId, t.createdAt)],
);
