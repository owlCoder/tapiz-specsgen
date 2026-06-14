"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "@tapizlabs/ui";
import { useTheme } from "@/components/theme/ThemeProvider";

export function LandingButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const { theme } = useTheme();

  const variantClass =
    variant === "primary" || variant === "secondary"
      ? `lp-btn lp-btn-${variant} inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm transition-all duration-150 cursor-pointer ${
          variant === "primary" ? (theme === "dark" ? "!text-black" : "!text-white") : ""
        }`
      : `lp-btn lp-btn-${variant}`;
  const classes = `${variantClass} ${className}`.trim();

  const content = (
    <>
      <span>{children}</span>
      <ArrowRight size={14} />
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
