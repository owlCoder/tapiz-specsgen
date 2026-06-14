"use client";

import { ExternalLink, LogoMark } from "@tapizlabs/ui";
import { useI18n } from "@/i18n/I18nProvider";
import pkg from "../../../package.json";

const APP_VERSION = pkg.version;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3">
      <span className="font-mono text-xs text-txt-4">{label}</span>
      <span className="text-xs font-semibold text-txt-1">{value}</span>
    </div>
  );
}

export function SettingsInfoSection() {
  const { dict } = useI18n();
  const t = dict.settings.info;

  return (
    <div className="mx-auto max-w-lg animate-in fade-in duration-200">
      <div className="mb-8 flex flex-col items-center pt-2 text-center">
        <div className="mb-4 grid h-18 w-18 place-items-center border border-primary-300 bg-(--color-icon-bg) text-primary-300">
          <LogoMark size={56} />
        </div>
        <h2 className="mb-1 text-xl font-bold text-txt-1">{t.productTitle}</h2>
        <span className="mt-3 border border-primary-300/35 bg-primary-300/8 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary-300">
          v{APP_VERSION} · {t.releaseLabel}
        </span>
      </div>

      <div className="mb-6">
        <InfoRow label={t.versionLabel} value={`v${APP_VERSION}`} />
        <InfoRow label={t.environmentLabel} value={t.environmentValue} />
        <InfoRow label={t.platformLabel} value={t.platformValue} />
        <InfoRow label={t.authorLabel} value={t.authorValue} />
        <InfoRow label={t.lastUpdateLabel} value={dict.changelog.v010Date} />
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <a
          href="/changelog"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between border border-border bg-ink-200 px-4 py-3 text-sm font-medium text-txt-2 no-underline transition-colors hover:border-primary-300 hover:text-primary-300"
        >
          <span>{dict.changelog.title}</span>
          <ExternalLink size={14} />
        </a>
        <a
          href="/status"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between border border-border bg-ink-200 px-4 py-3 text-sm font-medium text-txt-2 no-underline transition-colors hover:border-primary-300 hover:text-primary-300"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            {t.statusLinkLabel}
          </span>
          <ExternalLink size={14} />
        </a>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-txt-4">{t.footerNote}</p>
    </div>
  );
}
