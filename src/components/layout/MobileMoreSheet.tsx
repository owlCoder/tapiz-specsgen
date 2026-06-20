"use client";

import { Gear, LogOut, Moon, Sun, X } from "@tapizlabs/ui";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, LOCALE_COOKIE, type Locale } from "@/i18n/config";

function setLocaleCookie(value: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export interface AppNavItem {
  label: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface AppNavGroup {
  label: string;
  items: AppNavItem[];
}

interface MobileMoreSheetProps {
  open: boolean;
  user: { name: string; firstName: string; lastName: string };
  roleLabel: string;
  navGroups: AppNavGroup[];
  onClose: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

function ActionButton({
  label,
  icon,
  onClick,
  warn = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  warn?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer flex-col items-center gap-2 border p-3 transition-all active:scale-95 ${
        warn
          ? "border-warn/30 bg-warn/10 text-warn"
          : "border-border bg-ink-200 text-txt-2"
      }`}
    >
      <span className={`flex items-center justify-center ${warn ? "text-warn" : "text-txt-3"}`}>
        {icon}
      </span>
      <span
        className={`text-center font-mono text-[11px] font-medium ${warn ? "text-warn" : "text-txt-2"}`}
      >
        {label}
      </span>
    </button>
  );
}

export function MobileMoreSheet({
  open,
  user,
  roleLabel,
  navGroups,
  onClose,
  onSettings,
  onLogout,
}: MobileMoreSheetProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, dict } = useI18n();
  const router = useRouter();

  if (!open) return null;

  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "TZ";

  const selectLocale = (value: Locale) => {
    setLocaleCookie(value);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-80 sm:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all" />
      <div
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col border-t border-border bg-ink-100 shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto py-2">
          {/* ── User header ───────────────────────────── */}
          <div className="relative mb-2 flex items-center gap-3 border-b border-border px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              title={dict.common.close}
              className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center border-none bg-transparent text-txt-3 transition-colors hover:text-txt-1"
            >
              <X size={16} />
            </button>
            <div className="grid h-11 w-11 shrink-0 place-items-center bg-primary-300 font-display text-sm font-bold text-ink-100">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-txt-1">{user.name}</p>
              <span className="inline-flex items-center border border-primary-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary-300">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* ── Account actions ───────────────────────── */}
          <div className="mb-4">
            <p className="px-4 pb-2 pt-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-3">
              {dict.nav.account}
            </p>
            <div className="grid grid-cols-3 gap-3 px-4">
              <ActionButton
                label={dict.nav.settings}
                icon={<Gear size={28} />}
                onClick={() => {
                  onClose();
                  onSettings();
                }}
              />
              <ActionButton
                label={theme === "dark" ? dict.common.lightTheme : dict.common.darkTheme}
                icon={theme === "dark" ? <Sun size={28} /> : <Moon size={28} />}
                onClick={toggleTheme}
              />
              <ActionButton
                warn
                label={dict.nav.logout}
                icon={<LogOut size={28} />}
                onClick={() => {
                  onClose();
                  onLogout();
                }}
              />
            </div>

            {/* ── Locale selector ───────────────────────── */}
            <div className="mt-4 px-4">
              <p className="pb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-3">
                {dict.common.language}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {LOCALES.map((l) => {
                  const active = l === locale;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => selectLocale(l)}
                      className={`flex cursor-pointer flex-col items-center gap-1 border px-1 py-2.5 transition-colors duration-150 active:scale-95 ${
                        active
                          ? "border-primary-300 bg-primary-300/10 text-primary-300"
                          : "border-border bg-ink-200 text-txt-3"
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">{LOCALE_SHORT[l]}</span>
                      <span
                        className={`font-mono text-[10px] ${active ? "text-primary-300" : "text-txt-4"}`}
                      >
                        {LOCALE_LABELS[l]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Extra nav groups ──────────────────────── */}
          {navGroups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.label} className="mb-4 px-4">
                <p className="pb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-txt-3">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <button
                      key={String(item.label)}
                      type="button"
                      disabled={item.disabled}
                      onClick={
                        item.disabled
                          ? undefined
                          : () => {
                              onClose();
                              item.onClick();
                            }
                      }
                      className={`flex w-full cursor-pointer items-center gap-2.5 border px-3 py-2.5 text-left text-[13px] transition-colors ${
                        item.active
                          ? "border-primary-300/60 bg-primary-300/10 font-semibold text-primary-300"
                          : "border-border bg-ink-200 font-medium text-txt-2"
                      } ${item.disabled ? "cursor-default opacity-65" : ""}`}
                    >
                      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
