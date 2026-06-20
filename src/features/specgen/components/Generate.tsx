"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Check,
  Copy,
  Download,
  History,
  Pdf,
  Surface,
} from "@tapizlabs/ui";
import type { AppSettings, ArchiveEntry, Course } from "../types/spec.types";
import { buildVariant, generateMarkdown } from "../lib/variant";
import { printSpecPdf } from "../lib/pdf";
import { Preview } from "./Preview";
import { createArchiveEntryAction } from "@/lib/actions/archive.actions";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/config";

function downloadFile(text: string, name: string) {
  const b = new Blob([text], { type: "text/markdown" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  URL.revokeObjectURL(u);
}

interface Props {
  course: Course;
  settings: AppSettings;
  onArchived: (entry: ArchiveEntry) => void;
}

export function Generate({ course, settings, onArchived }: Props) {
  const { dict } = useI18n();
  const t = dict.specgen.generate;
  const [team, setTeam] = useState(0);
  const [copied, setCopied] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archived, setArchived] = useState(false);

  const n = course.varyByTeam ? Math.max(1, course.numTeams || 1) : 1;
  const variant = buildVariant(course, settings, course.varyByTeam ? team : 0);
  const md = generateMarkdown(course, settings, variant);

  const allVariants = () =>
    Array.from({ length: n }).map((_, i) => buildVariant(course, settings, i));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      const el = document.getElementById("mdout") as HTMLTextAreaElement | null;
      if (el) { el.select(); try { document.execCommand("copy"); } catch {} }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const archiveNow = async () => {
    setArchiving(true);
    const variants = allVariants().map((v) => ({
      teamIndex: v.teamIndex,
      code: v.code,
      scenario: v.scenario?.naziv || "",
      markdown: generateMarkdown(course, settings, v),
    }));
    const result = await createArchiveEntryAction({
      courseId: course.id,
      courseName: course.name,
      abbr: course.abbr,
      academicYear: settings.academicYear,
      faculty: settings.faculty,
      variants,
    });
    setArchiving(false);
    if (!result.ok) return;
    onArchived(result.data);
    setArchived(true);
    setTimeout(() => setArchived(false), 1800);
  };

  return (
    <div className="space-y-4">
      <Surface variant="raised" padding="sm">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={copied ? <Check size={14} /> : <Copy size={14} />}
            onClick={() => void copy()}
          >
            {copied ? t.copied : t.copy}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Pdf size={14} />}
            onClick={() => printSpecPdf(course, settings, variant)}
          >
            {t.downloadPdf}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={14} />}
            onClick={() => downloadFile(md, `${variant.code}.md`)}
          >
            {t.downloadMd}
          </Button>
          {course.varyByTeam && (
            <Button
              size="sm"
              variant="secondary"
              icon={<Download size={14} />}
              onClick={() =>
                downloadFile(
                  allVariants().map((v) => generateMarkdown(course, settings, v)).join("\n\n---\n\n"),
                  `${course.abbr || course.name}_${settings.academicYear.replace("/", "-")}_sve.md`,
                )
              }
            >
              {t.allGroups}
            </Button>
          )}
          <Button
            size="sm"
            icon={archived ? <Check size={14} /> : <History size={14} />}
            loading={archiving}
            onClick={() => void archiveNow()}
          >
            {archived ? t.archived : t.archive}
          </Button>
        </div>
      </Surface>

      {course.varyByTeam && (
        <Surface variant="raised" padding="sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-(--tapiz-text-muted)">
              {t.group}
            </span>
            <Badge variant="info">{variant.code}</Badge>
            {variant.scenario && (
              <Badge variant="muted">{variant.scenario.naziv}</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: n }).map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={team === i ? "primary" : "secondary"}
                onClick={() => setTeam(i)}
              >
                {fmt(t.groupN, { n: i + 1 })}
              </Button>
            ))}
          </div>
        </Surface>
      )}

      <Preview course={course} settings={settings} variant={variant} />

      <Surface variant="raised" padding="sm">
        <details>
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-(--tapiz-text-muted)">
            {t.markdownSource}
          </summary>
          <textarea
            id="mdout"
            readOnly
            value={md}
            className="mt-3 h-72 w-full resize-none rounded border border-(--tapiz-border-subtle) bg-(--tapiz-bg-input) p-3 font-mono text-xs text-(--tapiz-text-primary) focus:outline-none"
          />
        </details>
      </Surface>
    </div>
  );
}
