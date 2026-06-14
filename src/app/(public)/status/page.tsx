import Link from "next/link";
import { sql } from "drizzle-orm";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { db } from "@/infrastructure/db/client";
import { INTL_LOCALES, fmt } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";

async function checkDb(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

const SVC_COLOR = {
  operational: { color: "#1D9E75", bg: "rgba(29,158,117,0.12)", dot: "#1D9E75" },
  outage: { color: "#D4537E", bg: "rgba(212,83,126,0.12)", dot: "#D4537E" },
} as const;

function ServiceStatusBadge({ ok, labels }: { ok: boolean; labels: { up: string; down: string } }) {
  const cfg = SVC_COLOR[ok ? "operational" : "outage"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold font-mono whitespace-nowrap shrink-0"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
      {ok ? labels.up : labels.down}
    </span>
  );
}

function ServiceRow({
  name,
  ok,
  last,
  labels,
}: {
  name: string;
  ok: boolean;
  last?: boolean;
  labels: { up: string; down: string };
}) {
  const cfg = SVC_COLOR[ok ? "operational" : "outage"];
  return (
    <div
      className="flex items-center px-4 sm:px-5 py-3 sm:py-3.5"
      style={{
        borderBottom: last ? "none" : "1px solid var(--color-border)",
        background: "var(--color-ink-200)",
      }}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
        <span className="font-mono text-xs sm:text-sm truncate text-txt-2">{name}</span>
      </div>
      <ServiceStatusBadge ok={ok} labels={labels} />
    </div>
  );
}

export default async function StatusPage() {
  const dbOk = await checkDb();
  const allOk = dbOk;
  const locale = await getLocale();
  const dict = await getDict();
  const t = dict.status;
  const badgeLabels = { up: t.operational, down: t.unavailable };

  const overallColor = allOk ? "#1D9E75" : "#D4537E";
  const overallBg = allOk ? "rgba(29,158,117,0.06)" : "rgba(212,83,126,0.06)";
  const overallBorder = allOk ? "rgba(29,158,117,0.25)" : "rgba(212,83,126,0.25)";

  const intlLocale = INTL_LOCALES[locale];
  const now = new Date();
  const dateLabel = now.toLocaleDateString(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const updatedLabel = now.toLocaleString(intlLocale, { dateStyle: "long", timeStyle: "short" });

  return (
    <div>
      <div className="mb-8">
        <PublicPageHeader
          icon="activity"
          title={allOk ? t.allOperational : t.partialOutage}
          subtitle={t.subtitle}
          className="mb-2"
        />
        <p className="font-mono text-[11px] mt-1.5 text-txt-4">{dateLabel}</p>
      </div>

      {/* Overall banner */}
      <div
        className="mb-8 px-4 sm:px-5 py-4 relative overflow-hidden"
        style={{ background: overallBg, border: `1px solid ${overallBorder}` }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${overallColor}, transparent)` }}
        />
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
            style={{ background: overallColor }}
          />
          <span
            className="font-mono text-[11px] font-bold tracking-widest"
            style={{ color: overallColor }}
          >
            {allOk ? "OPERATIONAL" : "OUTAGE"}
          </span>
          <span className="font-mono text-[11px] text-txt-4">·</span>
          <span className="font-mono text-[11px] text-txt-4">
            {fmt(t.updated, { date: updatedLabel })}
          </span>
        </div>
      </div>

      {/* Services */}
      <div className="mb-10 sm:mb-12">
        <h2 className="font-display font-bold text-base sm:text-lg mb-3 text-txt-1">{t.services}</h2>
        <div className="flex flex-col overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          <ServiceRow name={t.app} ok labels={badgeLabels} />
          <ServiceRow name={t.database} ok={dbOk} labels={badgeLabels} />
          <ServiceRow name={t.authn} ok={dbOk} last labels={badgeLabels} />
        </div>
      </div>

      <p className="text-sm text-txt-4">
        {t.machineReadable}{" "}
        <Link href="/api/health" className="text-primary-300 hover:underline font-mono text-[12px]">
          /api/health
        </Link>
      </p>
    </div>
  );
}
