"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckSquare, ExternalLink, FileText, History, LockIcon, Server, UserCheck, Zap } from "@tapizlabs/ui";
import { useI18n } from "@/i18n/I18nProvider";
import appConfig from "@/app.config";
import { Brand } from "./primitives/Brand";

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function FooterLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const external = isExternalHref(href);
  const pageLink = !href.startsWith("#");
  const content = (
    <>
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
      {pageLink && <ExternalLink size={12} aria-hidden="true" />}
    </>
  );

  if (href.startsWith("#") || external) return <a href={href}>{content}</a>;
  return <Link href={href}>{content}</Link>;
}

export function LandingFooter() {
  const { dict } = useI18n();
  const t = dict.landing.footer;

  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-grid">
        <div className="lp-footer-brand">
          <Brand />
          <p>{t.description}</p>
        </div>
        <nav aria-label={t.product}>
          <strong>{t.product}</strong>
          <FooterLink href="#templates" icon={<FileText size={16} />}>
            {t.templates}
          </FooterLink>
          <FooterLink href="#features" icon={<CheckSquare size={16} />}>
            {t.features}
          </FooterLink>
          <FooterLink href="#cta" icon={<Zap size={16} />}>
            {t.start}
          </FooterLink>
        </nav>
        <nav aria-label={t.access}>
          <strong>{t.access}</strong>
          <FooterLink href="/login" icon={<LockIcon size={14} />}>
            {t.login}
          </FooterLink>
          <FooterLink href="/login" icon={<UserCheck size={14} />}>
            {t.register}
          </FooterLink>
        </nav>
        <nav aria-label={t.system}>
          <strong>{t.system}</strong>
          <FooterLink href="/changelog" icon={<History size={14} />}>
            {t.changelog}
          </FooterLink>
          <FooterLink href="/status" icon={<Server size={14} />}>
            {t.statusPage}
          </FooterLink>
        </nav>
      </div>
      <div className="lp-container lp-footer-bottom">
        <span>
          © {new Date().getFullYear()} {appConfig.name} by Tapiz Labs · {t.rights}
        </span>
      </div>
    </footer>
  );
}
