"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Check,
  FileText,
  Gear,
  History,
  Home,
  LogoMark,
  Plus,
  SidePanel,
  X,
} from "@tapizlabs/ui";
import type { AppSettings, ArchiveEntry, Course, CourseInput } from "../types/spec.types";
import { uid } from "../lib/uid";
import { Dashboard } from "./Dashboard";
import { Generate } from "./Generate";
import { Editor } from "./Editor";
import { ArchiveView } from "./ArchiveView";
import { SettingsView } from "./SettingsView";
import {
  createCourseAction,
  deleteCourseAction,
  loadTemplateCoursesAction,
  updateCourseAction,
} from "@/lib/actions/courses.actions";
import { logoutAction } from "@/lib/actions/auth.actions";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileMoreSheet } from "@/components/layout/MobileMoreSheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useI18n } from "@/i18n/I18nProvider";
import pkg from "../../../../package.json";

const APP_VERSION = (pkg as { version?: string }).version ?? "0.1.0";

type Panel = "edit" | "settings" | "archive" | "generate" | null;

function emptyCourse(): Course {
  return {
    id: uid(),
    name: "",
    abbr: "",
    yearOfStudy: 3,
    semester: 6,
    projectType: "timski",
    teamSize: 3,
    description: "",
    techStack: { jezik: "", backend: "", frontend: "", baza: "", ostalo: "" },
    usesAgileBoard: false,
    agileTool: "",
    optionalCount: 3,
    varyByTeam: false,
    numTeams: 6,
    entityVarMin: 0,
    entityVarMax: 0,
    modules: [],
    scenarios: [],
    nonFunctional: [],
    deliverables: [],
    grading: [],
    notes: "",
  };
}

interface Props {
  initialSettings: AppSettings;
  initialCourses: Course[];
  initialArchive: ArchiveEntry[];
  user: { name: string; id: string };
}

export function SpecGenApp({ initialSettings, initialCourses, initialArchive, user }: Props) {
  const { dict } = useI18n();
  const t = dict.specgen;
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [archive, setArchive] = useState<ArchiveEntry[]>(initialArchive);
  const [panel, setPanel] = useState<Panel>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [genId, setGenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("tapiz-specgen-sidebar-collapsed") === "true";
  });

  const nameParts = user.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts[1] ?? "";
  const userInitials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "TZ";

  const closePanel = () => {
    setPanel(null);
    setEditing(null);
    setGenId(null);
  };

  const openSettings = () => setPanel("settings");

  const startNew = () => {
    setEditing(emptyCourse());
    setPanel("edit");
  };

  const startEdit = (c: Course) => {
    setEditing(JSON.parse(JSON.stringify(c)));
    setPanel("edit");
  };

  const dupCourse = async (c: Course) => {
    const input: CourseInput = { ...JSON.parse(JSON.stringify(c)), name: c.name + " (kopija)" };
    const result = await createCourseAction(input);
    if (!result.ok) return;
    const created = result.data;
    setCourses((p) => [...p, created]);
  };

  const saveCourse = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, ...input } = editing;
    const exists = courses.some((x) => x.id === id);
    if (exists) {
      const result = await updateCourseAction(id, input);
      setSaving(false);
      if (!result.ok) return;
      const updated = result.data;
      setCourses((p) => p.map((x) => (x.id === id ? updated : x)));
    } else {
      const result = await createCourseAction(input);
      setSaving(false);
      if (!result.ok) return;
      const created = result.data;
      setCourses((p) => [...p, created]);
    }
    closePanel();
  };

  const deleteCourse = async (id: string) => {
    await deleteCourseAction(id);
    setCourses((p) => p.filter((x) => x.id !== id));
  };

  const loadTemplates = async () => {
    setTemplatesLoading(true);
    const result = await loadTemplateCoursesAction();
    setTemplatesLoading(false);
    if (!result.ok) return;
    setCourses(result.data);
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("tapiz-specgen-sidebar-collapsed", String(next));
      return next;
    });
  };

  const genCourse = courses.find((c) => c.id === genId) ?? null;

  const archiveBadge =
    archive.length > 0 ? (
      <Badge variant="info" className="ml-auto">{archive.length}</Badge>
    ) : undefined;

  const navGroups = [
    {
      items: [
        {
          label: t.nav.generator,
          icon: <Home size={16} />,
          active: panel === null,
          onClick: closePanel,
        },
        {
          label: t.nav.archive,
          icon: <History size={16} />,
          badge: archiveBadge,
          active: panel === "archive",
          onClick: () => setPanel("archive"),
        },
      ],
    },
  ];

  // Mobile bottom nav — primary 4 items
  const mobileNavItems = [
    { label: t.nav.generator, icon: <Home size={20} />, active: panel === null, onClick: closePanel },
    {
      label: t.nav.archive,
      icon: <History size={20} />,
      active: panel === "archive",
      onClick: () => setPanel("archive"),
      badge: archive.length > 0 ? archive.length : undefined,
    },
  ];

  const editorFooter = (
    <div className="flex items-center gap-2">
      <Button icon={<Check size={15} />} loading={saving} onClick={() => void saveCourse()}>
        {t.editor.save}
      </Button>
      <Button variant="secondary" icon={<X size={15} />} onClick={closePanel}>
        {t.editor.cancel}
      </Button>
    </div>
  );

  const dashboardEl = (
    <Dashboard
      courses={courses}
      archive={archive}
      settings={settings}
      userName={user.name}
      onNew={startNew}
      onEdit={startEdit}
      onDup={dupCourse}
      onDelete={deleteCourse}
      onGenerate={(id) => { setGenId(id); setPanel("generate"); }}
      onLoadTemplates={loadTemplates}
      templatesLoading={templatesLoading}
      onOpenArchive={() => setPanel("archive")}
      onOpenSettings={openSettings}
    />
  );

  return (
    <>
      <div className="min-h-screen bg-(--tapiz-bg-page)">
        {/* ── Mobile top header ─────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-border bg-ink-200 sm:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <button
              type="button"
              onClick={closePanel}
              className="flex items-center gap-2.5 no-underline"
            >
              <LogoMark size={28} variant="specs" />
              <span className="font-display text-base font-bold tracking-[-0.02em] text-txt-1">
                Tapiz Specs+
              </span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* ── Desktop layout ────────────────────────────── */}
        <div className="hidden min-h-screen sm:flex">
          <AppSidebar
            navGroups={navGroups}
            collapsed={sidebarCollapsed}
            userInitials={userInitials}
            userName={user.name}
            version={APP_VERSION}
            onToggleCollapsed={toggleSidebarCollapsed}
            onSettings={openSettings}
            onLogout={() => void logoutAction()}
          />
          <main className="min-w-0 flex-1">
            <div className="w-full px-6 py-6">
              <div className="pb-8">{dashboardEl}</div>
            </div>
          </main>
        </div>

        {/* ── Mobile main content ───────────────────────── */}
        <main className="sm:hidden">
          <div className="mx-auto w-full max-w-3xl px-4 py-4 pb-24">{dashboardEl}</div>
        </main>

        {/* ── Mobile bottom nav ─────────────────────────── */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ink-200/95 backdrop-blur-lg sm:hidden">
          <div className="flex items-center justify-around px-2 py-2">
            {mobileNavItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`relative flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium transition-colors ${
                  item.active ? "text-primary-300" : "text-txt-3"
                }`}
              >
                <span className="grid h-6 w-6 place-items-center [&_svg]:h-5 [&_svg]:w-5">
                  {item.icon}
                </span>
                <span className="max-w-full truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-300 px-1 font-mono text-[9px] font-bold text-ink-100">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            {/* More button */}
            <button
              type="button"
              onClick={() => setMoreSheetOpen(true)}
              className="flex min-w-0 cursor-pointer flex-col items-center gap-1 border-none bg-transparent px-2 py-1 text-[11px] font-medium text-txt-3 transition-colors"
            >
              <span className="grid h-6 w-6 place-items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </svg>
              </span>
              <span className="max-w-full truncate">{t.nav.more}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile more sheet ─────────────────────────────── */}
      <MobileMoreSheet
        open={moreSheetOpen}
        user={{ name: user.name, firstName, lastName }}
        roleLabel={t.roleAssistant}
        navGroups={[]}
        onClose={() => setMoreSheetOpen(false)}
        onSettings={() => { setMoreSheetOpen(false); openSettings(); }}
        onLogout={() => void logoutAction()}
      />

      {/* ── SidePanels ────────────────────────────────────── */}
      <SidePanel
        isOpen={panel === "edit" && editing !== null}
        onClose={closePanel}
        title={editing?.name ? t.editor.editTitle : t.editor.newTitle}
        subtitle={editing?.name || t.editor.subtitle}
        icon={<FileText size={18} />}
        width="xl"
        footer={editorFooter}
      >
        {editing && <Editor editing={editing} setEditing={setEditing} />}
      </SidePanel>

      <SidePanel
        isOpen={panel === "settings"}
        onClose={closePanel}
        title={t.settings.title}
        subtitle={t.settings.subtitle}
        icon={<Gear size={18} />}
        width="md"
      >
        <SettingsView settings={settings} onSaved={(s) => setSettings(s)} />
      </SidePanel>

      <SidePanel
        isOpen={panel === "archive"}
        onClose={closePanel}
        title={t.archive.title}
        subtitle={t.archive.subtitle}
        icon={<History size={18} />}
        width="lg"
      >
        <ArchiveView
          archive={archive}
          onDeleted={(id) => setArchive((p) => p.filter((x) => x.id !== id))}
        />
      </SidePanel>

      <SidePanel
        isOpen={panel === "generate" && genCourse !== null}
        onClose={closePanel}
        title={genCourse?.name ?? ""}
        subtitle={
          genCourse
            ? `${genCourse.abbr ? `(${genCourse.abbr}) · ` : ""}${settings.academicYear}`
            : ""
        }
        icon={<FileText size={18} />}
        width="xl"
      >
        {genCourse && (
          <Generate
            course={genCourse}
            settings={settings}
            onArchived={(entry) => setArchive((p) => [entry, ...p])}
          />
        )}
      </SidePanel>
    </>
  );
}
