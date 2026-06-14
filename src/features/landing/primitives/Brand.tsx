"use client";

import Link from "next/link";
import { LogoMark } from "@tapizlabs/ui";
import appConfig from "@/app.config";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="lp-brand" aria-label={appConfig.name}>
      <span className="lp-brand-mark" aria-hidden="true">
        <LogoMark size={compact ? 21 : 24} />
      </span>
      {!compact && <span className="lp-brand-name">{appConfig.name}</span>}
    </Link>
  );
}
