"use client";

import { CheckSquare, Download, FileText, LockIcon } from "@tapizlabs/ui";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Eyebrow } from "./primitives/Eyebrow";
import { LandingButton } from "./primitives/LandingButton";

const POINT_ICONS: ReactNode[] = [
  <FileText key="template" size={15} />,
  <CheckSquare key="ui" size={15} />,
  <Download key="layers" size={15} />,
  <LockIcon key="sso" size={15} />,
];

export function LandingCta() {
  const { dict } = useI18n();
  const t = dict.landing.cta;

  return (
    <section className="lp-cta-section" id="cta">
      <div className="lp-container">
        <div className="lp-cta-split">
          <div className="lp-cta-copy">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2>{t.title}</h2>
            <p>{t.description}</p>
          </div>
          <div className="lp-cta-panel">
            <div className="lp-cta-panel-top">
              {t.points.map((point, i) => (
                <span key={point}>
                  {POINT_ICONS[i]}
                  {point}
                </span>
              ))}
            </div>
            <div className="lp-hero-actions lp-cta-actions">
              <LandingButton href="/login">{t.createAccount}</LandingButton>
              <LandingButton href="/login" variant="secondary">
                {t.login}
              </LandingButton>
            </div>
            <small>{t.note}</small>
          </div>
        </div>
      </div>
    </section>
  );
}
