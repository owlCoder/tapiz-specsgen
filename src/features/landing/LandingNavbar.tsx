"use client";

import Link from "next/link";
import { ArrowRight, CheckSquare, FileText, LandingNavbarShell, Zap } from "@tapizlabs/ui";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { Brand } from "./primitives/Brand";
import { LandingButton } from "./primitives/LandingButton";

export function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { dict } = useI18n();
  const t = dict.landing.nav;

  const navItems = [
    { label: t.generator, href: "#generator", icon: <FileText size={16} /> },
    { label: t.features, href: "#features", icon: <CheckSquare size={16} /> },
    { label: t.access, href: "#cta", icon: <Zap size={16} /> },
  ];

  return (
    <LandingNavbarShell
      ariaNavLabel={t.ariaNav}
      brand={<Brand />}
      containerClassName="lp-container"
      closeMenuLabel={t.closeMenu}
      desktopActions={(
        <Link href="/login" className="lp-login-link gap-2">
          {t.login}
          <ArrowRight size={15} />
        </Link>
      )}
      desktopLanguageSwitcher={<LanguageSwitcher hideShortCode />}
      items={navItems}
      menuLabel={t.menu}
      mobileActions={(
        <LandingButton href="/login">{t.login}</LandingButton>
      )}
      mobileDialogLabel={t.menu}
      mobileLanguageSwitcher={<LanguageSwitcher hideShortCode />}
      mobileNavLabel={t.ariaMobileNav}
      onThemeToggle={toggleTheme}
      theme={theme}
      themeLabels={{
        dark: dict.common.darkTheme,
        light: dict.common.lightTheme,
      }}
    />
  );
}
