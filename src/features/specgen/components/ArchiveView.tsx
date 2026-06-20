"use client";

import { useState } from "react";
import {
  Button,
  ChevronDown,
  ChevronRight,
  ConfirmDialog,
  Download,
  EmptyState,
  Pdf,
  Surface,
  Trash,
  X,
} from "@tapizlabs/ui";
import type { ArchiveEntry } from "../types/spec.types";
import { deleteArchiveEntryAction } from "@/lib/actions/archive.actions";
import { printMarkdownPdf } from "../lib/pdf";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt, INTL_LOCALES } from "@/i18n/config";

function downloadFile(text: string, name: string) {
  const b = new Blob([text], { type: "text/markdown" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  URL.revokeObjectURL(u);
}

interface ViewMd {
  code: string;
  markdown: string;
  entryAbbr: string;
  entryYear: string;
  faculty: string;
}

interface Props {
  archive: ArchiveEntry[];
  onDeleted: (id: string) => void;
}

export function ArchiveView({ archive, onDeleted }: Props) {
  const { dict, locale } = useI18n();
  const t = dict.specgen.archive;
  const [open, setOpen] = useState<string | null>(null);
  const [viewMd, setViewMd] = useState<ViewMd | null>(null);
  const [deleting, setDeleting] = useState<ArchiveEntry | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    await deleteArchiveEntryAction(deleting.id);
    onDeleted(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="space-y-3">
      {archive.length === 0 ? (
        <Surface variant="raised" padding="md">
          <EmptyState
            title={t.emptyTitle}
            message={t.emptyMessage}
          />
        </Surface>
      ) : (
        <div className="space-y-2">
          {archive.map((a) => (
            <Surface key={a.id} variant="raised" padding="none">
              <div className="flex items-center justify-between gap-3 p-4">
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setOpen(open === a.id ? null : a.id)}
                >
                  <div className="flex items-center gap-2">
                    {open === a.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="font-display text-sm font-semibold text-(--tapiz-text-primary)">
                      {a.courseName}
                      {a.abbr && (
                        <span className="ml-1 font-normal text-(--tapiz-text-muted)">
                          ({a.abbr})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="ml-5 mt-0.5 font-mono text-[11px] text-(--tapiz-text-muted)">
                    {a.academicYear} · {fmt(t.variants, { n: a.variants.length })} ·{" "}
                    {new Date(a.createdAt).toLocaleDateString(INTL_LOCALES[locale])}
                  </div>
                </button>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Download size={14} />}
                    title={t.downloadAll}
                    onClick={() =>
                      downloadFile(
                        a.variants.map((v) => v.markdown).join("\n\n---\n\n"),
                        `${a.abbr || a.courseName}_${a.academicYear.replace("/", "-")}.md`,
                      )
                    }
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash size={14} />}
                    onClick={() => setDeleting(a)}
                  />
                </div>
              </div>

              {open === a.id && (
                <div className="border-t border-(--tapiz-border-subtle) flex flex-wrap gap-2 p-3">
                  {a.variants.map((v) => (
                    <Button
                      key={v.code}
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setViewMd({
                          code: v.code,
                          markdown: v.markdown,
                          entryAbbr: a.abbr || a.courseName,
                          entryYear: a.academicYear,
                          faculty: a.faculty,
                        })
                      }
                    >
                      {v.code}
                      {v.scenario ? ` · ${v.scenario}` : ""}
                    </Button>
                  ))}
                </div>
              )}
            </Surface>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={t.deleteTitle}
        description={fmt(t.deleteDesc, {
          name: deleting?.courseName ?? "",
          year: deleting?.academicYear ?? "",
        })}
        confirmLabel={dict.common.delete}
        cancelLabel={dict.common.cancel}
        icon={<Trash size={18} />}
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />

      {viewMd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewMd(null)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-(--tapiz-border-subtle) bg-(--tapiz-bg-surface) shadow-(--tapiz-shadow-lg)"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-(--tapiz-border-subtle) p-3">
              <span className="font-mono text-sm font-medium text-(--tapiz-text-primary)">
                {viewMd.code}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Pdf size={14} />}
                  onClick={() =>
                    printMarkdownPdf({
                      markdown: viewMd.markdown,
                      title: `${viewMd.entryAbbr} — ${viewMd.code}`,
                      faculty: viewMd.faculty,
                      academicYear: viewMd.entryYear,
                    })
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Download size={14} />}
                  onClick={() => downloadFile(viewMd.markdown, `${viewMd.code}.md`)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<X size={14} />}
                  onClick={() => setViewMd(null)}
                />
              </div>
            </div>
            <textarea
              readOnly
              value={viewMd.markdown}
              className="m-3 flex-1 resize-none rounded border border-(--tapiz-border-subtle) bg-(--tapiz-bg-input) p-3 font-mono text-xs text-(--tapiz-text-primary) focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
