"use client";

import { useEffect, useState } from "react";
import {
  Button,
  FieldLabel,
  FormError,
  InfoBanner,
  Input,
  Plus,
  Spinner,
  Trash,
} from "@tapizlabs/ui";
import {
  getCourseAssistantsAction,
  shareCourseAction,
  unshareCourseAction,
} from "@/lib/actions/courses.actions";
import type { CourseAssistant } from "@/application/share.service";
import { useI18n } from "@/i18n/I18nProvider";

interface Props {
  courseId: string;
}

export function ShareView({ courseId }: Props) {
  const { dict } = useI18n();
  const t = dict.specsgen.share;
  const [assistants, setAssistants] = useState<CourseAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await getCourseAssistantsAction(courseId);
      if (!active) return;
      if (result.ok) setAssistants(result.data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [courseId]);

  const add = async () => {
    const value = email.trim();
    if (!value) return;
    setAdding(true);
    setError(null);
    const result = await shareCourseAction(courseId, value);
    setAdding(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const created = result.data;
    setAssistants((p) =>
      p.some((a) => a.userId === created.userId) ? p : [...p, created],
    );
    setEmail("");
  };

  const remove = async (userId: string) => {
    const result = await unshareCourseAction(courseId, userId);
    if (!result.ok) return;
    setAssistants((p) => p.filter((a) => a.userId !== userId));
  };

  return (
    <div className="space-y-5">
      <InfoBanner text={t.hint} variant="info" />

      <div>
        <FieldLabel htmlFor="share-email">{t.emailLabel}</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="share-email"
            type="email"
            value={email}
            placeholder={t.emailPlaceholder}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void add();
              }
            }}
          />
          <Button icon={<Plus size={15} />} loading={adding} onClick={() => void add()}>
            {t.addButton}
          </Button>
        </div>
        <FormError message={error} />
      </div>

      <div>
        <div className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[.16em] text-txt-3">
          {t.listTitle}
        </div>
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : assistants.length === 0 ? (
          <div className="border border-border bg-ink-200 p-5 text-center font-mono text-[12px] tracking-[.04em] text-txt-3">
            {t.emptyList}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px border border-border bg-border">
            {assistants.map((a) => (
              <div key={a.userId} className="flex items-center gap-3 bg-ink-200 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-semibold text-txt-1">
                    {a.name}
                  </div>
                  <div className="truncate font-mono text-[11px] tracking-[.02em] text-txt-3">
                    {a.email}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash size={14} />}
                  title={t.removeTitle}
                  onClick={() => void remove(a.userId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
