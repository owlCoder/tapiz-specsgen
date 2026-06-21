"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  FileText,
  Gear,
  GraduationCap,
  History,
  Layers,
  Plus,
} from "@tapizlabs/ui";
import type { AppSettings, ArchiveEntry, Course } from "../types/spec.types";
import { Listing } from "./Listing";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt, INTL_LOCALES } from "@/i18n/config";

interface Props {
  courses: Course[];
  templates: Course[];
  archive: ArchiveEntry[];
  settings: AppSettings;
  userName: string;
  onNew: () => void;
  onEdit: (c: Course) => void;
  onDup: (c: Course) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  onShare: (c: Course) => void;
  onUseTemplate: (abbr: string) => void;
  templateBusyAbbr?: string | null;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

/* ── Mono uppercase section header (tapiz-reactjs-ui obrazac) ── */
function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3 px-0.5">
      <span className="font-mono text-[11px] tracking-[.14em] text-signal-400">{num}</span>
      <span className="font-mono text-[11px] font-medium uppercase tracking-[.2em] text-txt-2">
        {title}
      </span>
    </div>
  );
}

/* ── KPI kartica: mono labela, ogroman display broj, ikona ── */
function Kpi({
  label,
  value,
  sub,
  icon,
  accent = "text-txt-1",
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-0 border border-border bg-ink-200 p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-2">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[.18em] text-txt-3">
          {label}
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-border-hi bg-ink-300 text-primary-300">
          {icon}
        </span>
      </div>
      <div
        className={`mt-4 font-display text-[clamp(30px,3.4vw,42px)] font-semibold leading-none tracking-tight ${accent}`}
      >
        {value}
      </div>
      <div className="mt-3 font-mono text-[11px] tracking-[.04em] text-txt-3">{sub}</div>
    </div>
  );
}

/* ── Brza akcija: ikona-kvadrat + naziv + mono meta + strelica ── */
function QuickAction({
  icon,
  label,
  meta,
  badge,
  accentLine = "primary",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  badge?: number;
  accentLine?: "primary" | "signal";
  onClick: () => void;
}) {
  const line = accentLine === "primary" ? "bg-primary-300" : "bg-signal-400";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-3.5 bg-ink-200 px-5 py-4.5 text-left transition-colors hover:bg-ink-300"
    >
      <span
        className={`absolute bottom-0 left-0 top-0 w-0.75 ${line} opacity-0 transition-opacity group-hover:opacity-100`}
      />
      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-border-hi bg-ink-300 text-primary-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display text-sm font-semibold text-txt-1">
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center bg-primary-300/15 px-1 font-mono text-[10px] font-bold text-primary-300">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10.5px] uppercase tracking-[.06em] text-txt-3">
          {meta}
        </span>
      </span>
      <span className="ml-auto text-txt-4 transition-all group-hover:translate-x-0.5 group-hover:text-primary-300">
        <ArrowRight size={16} />
      </span>
    </button>
  );
}

export function Dashboard({
  courses,
  templates,
  archive,
  settings,
  userName,
  onNew,
  onEdit,
  onDup,
  onDelete,
  onGenerate,
  onShare,
  onUseTemplate,
  templateBusyAbbr = null,
  onOpenArchive,
  onOpenSettings,
}: Props) {
  const { dict, locale } = useI18n();
  const t = dict.specsgen.dashboard;

  // Sat se osvežava svake minute — strip pokazuje živo vreme.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const totalVariants = archive.reduce((a, e) => a + e.variants.length, 0);
  const firstName = userName.trim().split(/\s+/)[0] || userName;

  const greeting =
    now.getHours() >= 6 && now.getHours() < 12
      ? t.greetingMorning
      : now.getHours() >= 12 && now.getHours() < 20
        ? t.greetingAfternoon
        : t.greetingEvening;

  const dateStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const recent = [...archive]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-9">
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="pt-1">
        <div className="mb-3 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[.18em] text-txt-3">
          <span className="tz-pulse h-2 w-2 shrink-0 bg-signal-400" />
          <span>{dateStr} · {timeStr}</span>
        </div>
        <h1 className="font-display text-[clamp(28px,4.4vw,48px)] font-semibold leading-[1.05] tracking-tight text-txt-1">
          {greeting},{" "}
          <span className="relative isolate inline-block px-0.5 text-primary-300">
            {firstName}
            <span className="absolute -bottom-0.5 left-0 right-0 -z-10 h-1.5 bg-signal-400/60" />
          </span>
          <span className="text-signal-400">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-mono text-[13px] tracking-[.02em] text-txt-2">
          {t.heroSub}
        </p>
      </section>

      {/* ── KPI ─────────────────────────────────────────── */}
      <section>
        <SectionHead num="01" title={t.sectionStats} />
        <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          <Kpi
            label={t.statCourses}
            value={courses.length}
            sub={t.statCoursesDesc}
            icon={<GraduationCap size={15} />}
            accent="text-primary-300"
          />
          <Kpi
            label={t.statGenerations}
            value={archive.length}
            sub={t.statGenerationsDesc}
            icon={<History size={15} />}
          />
          <Kpi
            label={t.statVariants}
            value={totalVariants}
            sub={t.statVariantsDesc}
            icon={<Layers size={15} />}
            accent="text-signal-400"
          />
          <Kpi
            label={t.statYear}
            value={settings.academicYear || "—"}
            sub={t.statYearDesc}
            icon={<FileText size={15} />}
          />
        </div>
      </section>

      {/* ── Brze akcije + nedavna aktivnost ─────────────── */}
      <div className="grid gap-9 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <SectionHead num="02" title={t.sectionActions} />
          <div className="grid grid-cols-1 gap-px border border-border bg-border">
            <QuickAction
              icon={<Plus size={18} />}
              label={t.newCourse}
              meta={t.newCourseMeta}
              onClick={onNew}
            />
            <QuickAction
              icon={<History size={18} />}
              label={t.openArchive}
              meta={t.openArchiveMeta}
              badge={archive.length}
              accentLine="signal"
              onClick={onOpenArchive}
            />
            <QuickAction
              icon={<Gear size={18} />}
              label={t.openSettings}
              meta={t.openSettingsMeta}
              accentLine="signal"
              onClick={onOpenSettings}
            />
          </div>
        </section>

        <section className="lg:col-span-3">
          <SectionHead num="03" title={t.sectionRecent} />
          {recent.length > 0 ? (
            <div className="grid grid-cols-1 gap-px border border-border bg-border">
              {recent.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3.5 bg-ink-200 px-4.5 py-3.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border-hi bg-ink-300 text-primary-300">
                    <History size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-semibold text-txt-1">
                      {e.courseName}
                      {e.abbr && <span className="ml-1 font-normal text-txt-3">({e.abbr})</span>}
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[.06em] text-txt-3">
                      {e.academicYear} · {fmt(t.recentVariants, { n: e.variants.length })}
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[10.5px] tracking-[.04em] text-txt-4">
                    {new Date(e.createdAt).toLocaleDateString(INTL_LOCALES[locale])}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-ink-200 p-8 text-center font-mono text-[12px] uppercase tracking-[.08em] text-txt-3">
              {t.recentEmpty}
            </div>
          )}
        </section>
      </div>

      {/* ── Lista predmeta ──────────────────────────────── */}
      <section>
        <SectionHead num="04" title={t.sectionCourses} />
        <Listing
          courses={courses}
          templates={templates}
          onNew={onNew}
          onEdit={onEdit}
          onDup={onDup}
          onDelete={onDelete}
          onGenerate={onGenerate}
          onShare={onShare}
          onUseTemplate={onUseTemplate}
          templateBusyAbbr={templateBusyAbbr}
          hideHeader
        />
      </section>
    </div>
  );
}
