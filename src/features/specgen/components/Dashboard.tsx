"use client";

import {
  Badge,
  Button,
  FileText,
  Gear,
  GraduationCap,
  History,
  Layers,
  MetricCard,
  PageHeader,
  Plus,
  SectionTitle,
  StatGrid,
  Surface,
  Timeline,
} from "@tapizlabs/ui";
import type { AppSettings, ArchiveEntry, Course } from "../types/spec.types";
import { Listing } from "./Listing";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt, INTL_LOCALES } from "@/i18n/config";

interface Props {
  courses: Course[];
  archive: ArchiveEntry[];
  settings: AppSettings;
  onNew: () => void;
  onEdit: (c: Course) => void;
  onDup: (c: Course) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  onReset: () => void;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
}

export function Dashboard({
  courses,
  archive,
  settings,
  onNew,
  onEdit,
  onDup,
  onDelete,
  onGenerate,
  onReset,
  onOpenArchive,
  onOpenSettings,
}: Props) {
  const { dict, locale } = useI18n();
  const t = dict.specgen.dashboard;

  const totalVariants = archive.reduce((a, e) => a + e.variants.length, 0);

  const recent = [...archive]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      title: `${e.courseName}${e.abbr ? ` (${e.abbr})` : ""}`,
      description: `${e.academicYear} · ${fmt(t.recentVariants, { n: e.variants.length })}`,
      time: new Date(e.createdAt).toLocaleDateString(INTL_LOCALES[locale]),
      icon: <History size={14} />,
      tone: "info" as const,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        variant="enterprise"
        actions={
          <Button icon={<Plus size={16} />} onClick={onNew}>
            {t.newCourse}
          </Button>
        }
      />

      {/* ── Metrike ─────────────────────────────────────── */}
      <StatGrid minColumnWidth="160px">
        <MetricCard
          variant="raised"
          label={t.statCourses}
          value={courses.length}
          description={t.statCoursesDesc}
          icon={<GraduationCap size={18} />}
        />
        <MetricCard
          variant="raised"
          label={t.statGenerations}
          value={archive.length}
          description={t.statGenerationsDesc}
          icon={<History size={18} />}
        />
        <MetricCard
          variant="raised"
          label={t.statVariants}
          value={totalVariants}
          description={t.statVariantsDesc}
          icon={<Layers size={18} />}
        />
        <MetricCard
          variant="raised"
          label={t.statYear}
          value={settings.academicYear || "—"}
          description={settings.faculty || ""}
          icon={<FileText size={18} />}
        />
      </StatGrid>

      {/* ── Brze akcije + nedavne generacije ────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Surface variant="raised" padding="md" className="lg:col-span-1">
          <SectionTitle>{t.quickActions}</SectionTitle>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="primary" icon={<Plus size={15} />} onClick={onNew} fullWidth>
              {t.newCourse}
            </Button>
            <Button variant="secondary" icon={<History size={15} />} onClick={onOpenArchive} fullWidth>
              {t.openArchive}
              {archive.length > 0 && <Badge variant="info" className="ml-auto">{archive.length}</Badge>}
            </Button>
            <Button variant="secondary" icon={<Gear size={15} />} onClick={onOpenSettings} fullWidth>
              {t.openSettings}
            </Button>
          </div>
        </Surface>

        <Surface variant="raised" padding="md" className="lg:col-span-2">
          <SectionTitle>{t.recentTitle}</SectionTitle>
          <div className="mt-3">
            {recent.length > 0 ? (
              <Timeline items={recent} />
            ) : (
              <p className="text-sm text-(--tapiz-text-muted)">{t.recentEmpty}</p>
            )}
          </div>
        </Surface>
      </div>

      {/* ── Lista predmeta ──────────────────────────────── */}
      <div>
        <SectionTitle>{t.coursesTitle}</SectionTitle>
        <div className="mt-3">
          <Listing
            courses={courses}
            onNew={onNew}
            onEdit={onEdit}
            onDup={onDup}
            onDelete={onDelete}
            onGenerate={onGenerate}
            onReset={onReset}
            hideHeader
          />
        </div>
      </div>
    </div>
  );
}
