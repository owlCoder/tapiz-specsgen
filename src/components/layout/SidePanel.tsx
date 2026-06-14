"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@tapizlabs/ui";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface SidePanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  width?: "md" | "lg";
  onClose: () => void;
  children: ReactNode;
}

/**
 * Bočni panel sa desne strane (kao StoryDetailPanel) — standard za create/edit forme.
 * Ulaz/izlaz idu kroz CSS tranzicije (translate + opacity) umesto keyframe animacija:
 * deterministične su, bez fill-mode/replay flash-eva; unmount posle isteka tranzicije.
 */
export function SidePanel({
  open,
  title,
  subtitle,
  icon,
  width = "md",
  onClose,
  children,
}: SidePanelProps) {
  const { dict } = useI18n();
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  // Sinhrona uskladjivanja tokom rendera (React šablon umesto setState u efektu).
  if (open && !mounted) setMounted(true);
  if (!open && shown) setShown(false);

  useEffect(() => {
    if (open) {
      // Dupli rAF: prvi render mora da iscrta početno (skriveno) stanje pre tranzicije.
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    const timer = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    let restoreScroll: (() => void) | null = null;

    const lockScroll = () => {
      if (restoreScroll) return;

      const htmlOverflow = document.documentElement.style.overflow;
      const bodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      restoreScroll = () => {
        document.documentElement.style.overflow = htmlOverflow;
        document.body.style.overflow = bodyOverflow;
        restoreScroll = null;
      };
    };

    const syncScrollLock = () => {
      if (mediaQuery.matches) {
        lockScroll();
        return;
      }

      restoreScroll?.();
    };

    syncScrollLock();
    mediaQuery.addEventListener("change", syncScrollLock);

    return () => {
      mediaQuery.removeEventListener("change", syncScrollLock);
      restoreScroll?.();
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-140 flex justify-end bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 max-sm:h-dvh max-sm:w-dvw max-sm:justify-start max-sm:overflow-hidden ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className={`flex h-full w-full transform flex-col overflow-hidden border-l border-border-hi border-t-2 border-t-primary-300 bg-ink-100 transition-transform duration-200 ease-out max-sm:h-dvh max-sm:max-w-none max-sm:border-l-0 ${
          width === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"
        } ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {icon ? (
              <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary-300/10 text-primary-300">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate font-display text-sm font-bold text-txt-1">{title}</h2>
              {subtitle ? (
                <p className="mt-0.5 truncate text-xs text-primary-300">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title={dict.common.close}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-txt-3 transition-colors hover:text-txt-1"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
