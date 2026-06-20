"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "@tapizlabs/ui";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, LOCALE_COOKIE, type Locale } from "./config";
import { useI18n } from "./I18nProvider";

function setLocaleCookie(value: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
}

/* Dropdown u stilu LanguageSwitcher-a iz tapiz-reactjs-ui:
   - full: landing/auth navbar, otvara se nadole;
   - compact: dno sidebara, otvara se NAGORE (da ga viewport ne odseče);
   - collapsed: skupljeni sidebar, samo globus, otvara se nagore. */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const dropdownStyle: React.CSSProperties = {
  background: "var(--color-ink-200)",
  border: "1px solid var(--color-border-hi)",
  borderTop: "2px solid var(--color-primary-300)",
  boxShadow: "0 16px 48px -8px rgba(0,0,0,0.45)",
};

function OptionRow({
  locale,
  current,
  onSelect,
}: {
  locale: Locale;
  current: Locale;
  onSelect: () => void;
}) {
  const active = locale === current;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors duration-100"
      style={{
        color: active ? "var(--color-primary-300)" : "var(--color-txt-2)",
        background: active ? "rgba(94,231,255,0.06)" : "transparent",
      }}
    >
      <span className="font-mono text-xs font-bold w-6 shrink-0">{LOCALE_SHORT[locale]}</span>
      <span>{LOCALE_LABELS[locale]}</span>
      {active && (
        <svg
          className="ml-auto"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

interface LanguageSwitcherProps {
  variant?: "full" | "compact";
  /** Za uske navbare: prikazi samo globus + chevron, bez kratkog koda jezika. */
  hideShortCode?: boolean;
  /** Skupljeni sidebar: samo globus, bez koda jezika. */
  collapsed?: boolean;
}

export function LanguageSwitcher({
  variant = "full",
  hideShortCode = false,
  collapsed = false,
}: LanguageSwitcherProps) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const select = (value: Locale) => {
    setLocaleCookie(value);
    setOpen(false);
    router.refresh();
  };

  if (collapsed) {
    return (
      <div ref={ref} className="relative flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          title={dict.common.language}
          className="flex h-8 w-8 items-center justify-center transition-colors duration-150"
          style={{
            color: "var(--color-txt-3)",
            background: open ? "var(--color-ink-300)" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Globe size={15} />
        </button>
        {open && (
          <div className="absolute bottom-full mb-1 ml-20 z-50 min-w-52 overflow-hidden" style={dropdownStyle}>
            {LOCALES.map((l) => (
              <OptionRow key={l} locale={l} current={locale} onSelect={() => select(l)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          title={dict.common.language}
          className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs font-semibold transition-colors duration-150"
          style={{
            color: "var(--color-txt-3)",
            background: open ? "var(--color-ink-300)" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Globe size={14} />
          {!hideShortCode ? (
            <span className="font-mono text-xs font-bold">{LOCALE_SHORT[locale]}</span>
          ) : null}
          <ChevronIcon open={open} />
        </button>
        {open && (
          <div className="absolute bottom-full mb-1 left-0 z-50 min-w-44 overflow-hidden" style={dropdownStyle}>
            {LOCALES.map((l) => (
              <OptionRow key={l} locale={l} current={locale} onSelect={() => select(l)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={dict.common.language}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm transition-colors duration-150"
        style={{
          color: open ? "var(--color-txt-1)" : "var(--color-txt-3)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Globe size={14} />
        <span className="font-mono text-xs font-bold">{LOCALE_SHORT[locale]}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 min-w-44 overflow-hidden" style={dropdownStyle}>
          {LOCALES.map((l) => (
            <OptionRow key={l} locale={l} current={locale} onSelect={() => select(l)} />
          ))}
        </div>
      )}
    </div>
  );
}
