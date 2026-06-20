"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  Copy,
  Download,
  Edit,
  EmptyState,
  FileText,
  PageHeader,
  Plus,
  RotateCcw,
  Surface,
  Trash,
  Users,
} from "@tapizlabs/ui";
import type { Course } from "../types/spec.types";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/config";

interface Props {
  courses: Course[];
  onNew: () => void;
  onEdit: (c: Course) => void;
  onDup: (c: Course) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  onReset: () => void;
  /** Kad je ugnežden u dashboard, naslov dolazi spolja. */
  hideHeader?: boolean;
}

export function Listing({
  courses,
  onNew,
  onEdit,
  onDup,
  onDelete,
  onGenerate,
  onReset,
  hideHeader = false,
}: Props) {
  const { dict } = useI18n();
  const t = dict.specgen.listing;
  const [deleting, setDeleting] = useState<Course | null>(null);
  const [resetting, setResetting] = useState(false);

  return (
    <div className="space-y-5">
      {!hideHeader && (
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
      )}

      {courses.length === 0 ? (
        <Surface variant="raised" padding="md">
          <EmptyState
            title={t.emptyTitle}
            message={t.emptyMessage}
          />
        </Surface>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => (
            <Surface key={c.id} variant="raised" padding="sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-semibold text-(--tapiz-text-primary)">
                      {c.name}
                    </span>
                    {c.abbr && (
                      <span className="font-mono text-xs text-(--tapiz-text-muted)">
                        ({c.abbr})
                      </span>
                    )}
                    {c.usesAgileBoard && (
                      <Badge variant="success">Agile: {c.agileTool || "da"}</Badge>
                    )}
                    {c.varyByTeam && (
                      <Badge variant="info">
                        <Users size={10} className="mr-1 inline" />
                        {t.byGroups}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-(--tapiz-text-muted)">
                    <span>{fmt(t.year, { n: c.yearOfStudy })}</span>
                    <span>{c.techStack.jezik || "—"}</span>
                    {!c.usesAgileBoard && <span>{t.noAgile}</span>}
                    <span>{fmt(t.modScen, { mod: c.modules.length, scen: c.scenarios.length })}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    icon={<FileText size={14} />}
                    onClick={() => onGenerate(c.id)}
                  >
                    {t.generate}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Edit size={14} />}
                    onClick={() => onEdit(c)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Copy size={14} />}
                    onClick={() => onDup(c)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash size={14} />}
                    onClick={() => setDeleting(c)}
                  />
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}

      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          icon={<RotateCcw size={13} />}
          onClick={() => setResetting(true)}
        >
          {t.reset}
        </Button>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={t.deleteTitle}
        description={fmt(t.deleteDesc, { name: deleting?.name ?? "" })}
        confirmLabel={dict.common.delete}
        cancelLabel={dict.common.cancel}
        icon={<Trash size={18} />}
        danger
        onConfirm={() => {
          if (deleting) onDelete(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmDialog
        open={resetting}
        title={t.resetTitle}
        description={t.resetDesc}
        confirmLabel={t.reset}
        cancelLabel={dict.common.cancel}
        icon={<RotateCcw size={18} />}
        danger
        onConfirm={() => {
          setResetting(false);
          onReset();
        }}
        onCancel={() => setResetting(false)}
      />
    </div>
  );
}
