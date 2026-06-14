"use client";

import { LogoMark } from "@tapizlabs/ui";
import { useI18n } from "@/i18n/I18nProvider";
import appConfig from "@/app.config";

export function AuthLeftPanel() {
  const { dict } = useI18n();
  const t = dict.auth.panel;
  return (
    <div
      className="hidden lg:flex lg:w-[46%] flex-col justify-between relative overflow-hidden
        bg-ink-200
        bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)]
        bg-size-[24px_24px]
        border-r border-border"
    >
      <div className="absolute top-0 left-0 right-0 h-0.75 bg-primary-300" />

      <div className="relative z-10 flex items-center gap-3 p-10 animate-fade-in-down">
          <LogoMark size={50} />
          <div>
            <div className="font-display text-[22px] font-bold tracking-tight text-txt-1">
              {appConfig.name}
            </div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-txt-4 mt-0.5">
            {t.tagline}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-10 pb-6 animate-scale-in">
        <div className="text-[11px] font-mono uppercase tracking-wider text-primary-300 mb-4">
          {t.kicker}
        </div>
        <h1 className="font-display text-[52px] font-semibold tracking-tighter leading-none m-0 mb-4 text-txt-1">
          {t.headline1}
          <br />
          {t.headline2}
          <br />
          <span className="text-primary-300">{t.headline3}</span>
        </h1>
        <p className="text-txt-2 text-sm max-w-95 leading-relaxed mb-8">{t.description}</p>

        <div className="border border-border-hi bg-ink-300 grid grid-cols-3 max-w-115">
          {t.stats.map((stat, i) => (
            <div key={stat.value} className={`p-[14px_16px] ${i > 0 ? "border-l border-border" : ""}`}>
              <div className="font-display font-semibold text-[13px] text-txt-1">{stat.value}</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-txt-4 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-5">
          {t.chips.map((chip) => (
            <span
              key={chip}
              className="py-1 px-2.5 border border-border-hi font-mono text-[10px] tracking-widest uppercase text-txt-3 bg-ink-300"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 p-10 text-[11px] font-mono uppercase tracking-wider text-txt-4">
        © {new Date().getFullYear()} {appConfig.name.toUpperCase()}
      </div>
    </div>
  );
}
