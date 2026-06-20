"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "@tapizlabs/ui";

export function LandingButton({
  href,
  children,
  icon,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const variantClass =
    variant === "primary" || variant === "secondary"
      ? `lp-btn lp-btn-${variant} inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm transition-all duration-150 cursor-pointer`
      : `lp-btn lp-btn-${variant}`;
  const classes = `${variantClass} ${className}`.trim();

  const content = (
    <>
      {icon && <span className="lp-btn-leading">{icon}</span>}
      <span>{children}</span>
      <span className="lp-btn-arrow" aria-hidden="true">
        <ArrowRight size={14} />
      </span>
    </>
  );

  if (href.startsWith("#")) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
