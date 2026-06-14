"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Grid, Layers, LogoMark } from "@tapizlabs/ui";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useI18n } from "@/i18n/I18nProvider";
import { logoutAction } from "@/lib/actions/auth.actions";
import type { AuthProvider, Role } from "@/domain/types";
import { MobileMoreSheet, type AppNavGroup } from "@/components/layout/MobileMoreSheet";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppSettingsDialog } from "@/features/settings/AppSettingsDialog";
import appConfig from "@/app.config";
import pkg from "../../../package.json";

const APP_VERSION = pkg.version;

interface AppShellLayoutProps {
  user: {
    name: string;
    firstName: string;
    lastName: string;
    role: Role;
    email?: string;
    authProvider: AuthProvider;
    facultyName?: string | null;
    universityName?: string | null;
  };
  children: ReactNode;
}

export function AppShellLayout({ user, children }: AppShellLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { dict } = useI18n();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("tapiz-app-sidebar-collapsed") === "true";
  });

  const roleLabel = user.role === "admin" ? "Admin" : "User";
  const userInitials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "TA";

  // Preimenuj/dodaj nav stavke za svoju aplikaciju ovde.
  const navGroups = useMemo<AppNavGroup[]>(() => {
    const makeItem = (label: string, href: string, active: boolean, icon: React.ReactNode) => ({
      label,
      href,
      active,
      icon,
      onClick: () => { setMoreSheetOpen(false); router.push(href); },
    });

    return [
      {
        label: "App",
        items: [
          makeItem(dict.nav.home, "/dashboard", pathname === "/dashboard", <Grid size={16} />),
          makeItem(dict.nav.items, "/items", pathname.startsWith("/items"), <Layers size={16} />),
        ],
      },
    ];
  }, [dict, pathname, router]);

  const flatNavItems = navGroups.flatMap((g) => g.items);
  const mobilePrimaryItems = flatNavItems.slice(0, 4);
  const sheetNavGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((item) => !mobilePrimaryItems.includes(item)) }))
    .filter((g) => g.items.length > 0);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("tapiz-app-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <>
      <div className="min-h-screen bg-(--tapiz-bg-page)">
        <header className="sticky top-0 z-30 border-b border-border bg-ink-200 sm:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <LogoMark size={28} />
              <span className="font-display text-base font-bold tracking-[-0.02em] text-txt-1">{appConfig.name}</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <div className="hidden min-h-screen sm:flex">
          <AppSidebar
            navGroups={navGroups}
            collapsed={sidebarCollapsed}
            userInitials={userInitials}
            userName={user.name}
            roleLabel={roleLabel}
            version={APP_VERSION}
            onToggleCollapsed={toggleSidebarCollapsed}
            onSettings={() => setSettingsOpen(true)}
            onLogout={() => void logoutAction()}
          />
          <main className="min-w-0 flex-1">
            <div className="w-full px-6 py-6">
              <div className="pb-8">{children}</div>
            </div>
          </main>
        </div>

        <main className="sm:hidden">
          <div className="mx-auto w-full max-w-3xl px-4 py-4 pb-24">{children}</div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ink-200/95 backdrop-blur-lg sm:hidden">
          <div className="flex items-center justify-around px-2 py-2">
            {mobilePrimaryItems.map((item) => (
              <Link
                key={String(item.label)}
                href={item.href}
                className={`flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium no-underline transition-colors ${item.active ? "text-primary-300" : "text-txt-3"}`}
              >
                <span className="grid h-6 w-6 place-items-center [&_svg]:h-5 [&_svg]:w-5">{item.icon}</span>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            ))}
            {sheetNavGroups.length > 0 && (
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
                <span className="max-w-full truncate">{dict.nav.more}</span>
              </button>
            )}
          </div>
        </nav>
      </div>

      <MobileMoreSheet
        open={moreSheetOpen}
        user={user}
        roleLabel={roleLabel}
        navGroups={sheetNavGroups}
        onClose={() => setMoreSheetOpen(false)}
        onSettings={() => setSettingsOpen(true)}
        onLogout={() => void logoutAction()}
      />
      <AppSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} />
    </>
  );
}
