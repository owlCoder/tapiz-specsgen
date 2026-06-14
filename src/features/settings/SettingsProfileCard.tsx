"use client";

import { Mail, User } from "@tapizlabs/ui";
import { useI18n } from "@/i18n/I18nProvider";
import type { SettingsDialogUser } from "./AppSettingsDialog";

interface SettingsProfileCardProps {
  user: SettingsDialogUser;
}

export function SettingsProfileCard({ user }: SettingsProfileCardProps) {
  const { dict } = useI18n();
  const t = dict.settings.account;
  const roleLabel = user.role === "admin" ? "Admin" : "User";
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "TA";

  return (
    <article className="border border-border border-t-2 border-t-primary-300 bg-ink-200 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center border border-primary-300 bg-(--color-icon-bg) text-primary-300">
          <User size={17} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-sm font-bold text-txt-1">{t.profileTitle}</h3>
          <p className="mt-0.5 text-xs text-txt-3">{t.profileSubtitle}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 border border-border bg-ink-100 p-3">
        <div className="grid size-14 shrink-0 place-items-center border border-primary-300 bg-(--color-icon-bg) font-display text-base font-bold text-primary-300">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="truncate font-display text-base font-bold text-txt-1">{user.name}</div>
              {user.email && (
                <div className="mt-1.5 flex min-w-0 items-center gap-2">
                  <Mail size={13} className="shrink-0 text-primary-300" />
                  <span className="truncate font-mono text-[11px] text-txt-3" title={user.email}>
                    {user.email}
                  </span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-1.5">
              <span className="inline-flex items-center border border-primary-300/60 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-primary-300">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
