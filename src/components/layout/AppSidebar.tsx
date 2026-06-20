"use client";

import { ChevronLeft, Gear, LogOut, LogoMark } from "@tapizlabs/ui";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/config";

export interface SidebarItem {
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface SidebarGroup {
  label?: string;
  items: SidebarItem[];
}

interface AppSidebarProps {
  navGroups: SidebarGroup[];
  collapsed: boolean;
  userInitials: string;
  userName: string;
  version: string;
  onToggleCollapsed: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export function AppSidebar({
  navGroups,
  collapsed,
  userInitials,
  userName,
  version,
  onToggleCollapsed,
  onSettings,
  onLogout,
}: AppSidebarProps) {
  const { dict } = useI18n();

  const itemCls = (active: boolean) =>
    `flex w-full items-center gap-2.5 border-l-2 py-2.5 text-[13px] transition-[background,color] duration-100 cursor-pointer border-none bg-transparent ${
      active
        ? "border-l-primary-300 bg-ink-300 font-semibold text-txt-1"
        : "border-l-transparent font-medium text-txt-2 hover:bg-ink-300 hover:text-txt-1"
    } ${collapsed ? "justify-center px-0" : active ? "pl-3 pr-3.5" : "px-3.5"}`;

  return (
    <aside className="sticky top-0 h-screen shrink-0 border-r border-border bg-ink-200">
      <div
        className={`flex h-full flex-col transition-[width] duration-200 ease-in-out ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {/* ── Brand header ──────────────────────────────────── */}
        <div
          className={`flex h-14 shrink-0 items-center border-b border-border px-3.5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
            <LogoMark size={collapsed ? 24 : 32} variant="specs" className="shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-display text-[17px] font-bold tracking-[-0.02em] text-txt-1">
                  Tapiz Specs
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-txt-3">
                  {dict.specsgen.productTagline}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────── */}
        <nav className="min-h-0 flex-1 overflow-y-auto py-1.5">
          {navGroups.map((group, gi) => (
            <div key={gi} className="pb-4">
              {!collapsed && group.label && (
                <div className="px-4 pb-2 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-txt-4">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                <button
                  key={String(item.label)}
                  type="button"
                  disabled={item.disabled}
                  onClick={item.disabled ? undefined : item.onClick}
                  className={itemCls(item.active)}
                  title={String(item.label)}
                >
                  <span
                    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center ${
                      item.active ? "text-primary-300" : "text-inherit"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto">{item.badge}</span>
                  )}
                  {!collapsed && item.active && !item.badge && (
                    <span className="ml-auto h-1.25 w-1.25 shrink-0 bg-signal-400" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* ── User footer ───────────────────────────────────── */}
        <div className="shrink-0 border-t border-border p-2.5">
          {!collapsed ? (
            <>
              <div className="mb-1.5 flex items-stretch justify-between gap-2 px-1 py-2">
                <div className="flex min-w-0 items-stretch gap-2">
                  <div className="my-auto grid h-7 w-7 shrink-0 place-items-center bg-primary-300 font-display text-[11px] font-bold text-ink-100">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-txt-1">
                      {userName}
                    </div>
                    <div className="mt-0.5 inline-flex items-center border border-primary-300/60 px-1.5 py-px font-mono text-[9px] uppercase tracking-[.14em] text-primary-300">
                      {dict.specsgen.roleAssistant}
                    </div>
                  </div>
                </div>
                <div className="my-auto flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={onLogout}
                    title={dict.nav.logout}
                    className="flex cursor-pointer border-none bg-transparent p-1.5 text-warn"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center">
                      <LogOut size={16} />
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  title={dict.nav.settings}
                  onClick={onSettings}
                  className="flex cursor-pointer border-none bg-transparent p-1.5 text-txt-3 hover:text-primary-300"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <Gear size={16} />
                  </span>
                </button>
                <LanguageSwitcher variant="compact" />
                <ThemeToggle />
                <button
                  type="button"
                  title={dict.settings.collapse}
                  onClick={onToggleCollapsed}
                  className="flex cursor-pointer border-none bg-transparent p-1.5 text-txt-3 hover:text-primary-300"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <ChevronLeft size={16} />
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="grid h-7 w-7 place-items-center bg-primary-300 font-display text-[11px] font-bold text-ink-100"
                title={userName}
              >
                {userInitials}
              </div>
              <button
                type="button"
                title={dict.nav.settings}
                onClick={onSettings}
                className="flex cursor-pointer border-none bg-transparent p-1.5 text-txt-3 hover:text-primary-300"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <Gear size={16} />
                </span>
              </button>
              <LanguageSwitcher collapsed />
              <ThemeToggle />
              <button
                type="button"
                title={dict.settings.expand}
                onClick={onToggleCollapsed}
                className="flex cursor-pointer border-none bg-transparent p-1.5 text-txt-3 hover:text-primary-300"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <ChevronLeft size={16} className="rotate-180" />
                </span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                title={dict.nav.logout}
                className="flex cursor-pointer border-none bg-transparent p-1.5 text-warn"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <LogOut size={16} />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ── Version strip ─────────────────────────────────── */}
        <div className="shrink-0 px-2.5 pb-2 pt-1 text-center font-mono text-[8px] uppercase tracking-[0.2em] text-txt-4">
          {collapsed ? "SG" : fmt(dict.nav.build, { version })}
        </div>
      </div>
    </aside>
  );
}
