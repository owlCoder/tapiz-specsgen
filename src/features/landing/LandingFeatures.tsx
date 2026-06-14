"use client";

import { FileText, Layers, LockIcon, Zap } from "@tapizlabs/ui";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Eyebrow } from "./primitives/Eyebrow";

const FEATURE_ICONS: ReactNode[] = [
  <FileText key="auth" size={20} />,
  <Layers key="db" size={20} />,
  <Zap key="i18n" size={20} />,
  <LockIcon key="ui" size={20} />,
  <Zap key="deploy" size={20} />,
];

export function LandingFeatures() {
  const { dict } = useI18n();
  const t = dict.landing.features;

  return (
    <section className="lp-section" id="features">
      <span className="lp-section-number" aria-hidden="true">
        01
      </span>
      <div className="lp-container">
        <div className="lp-section-head">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2>{t.title}</h2>
          <p>{t.description}</p>
        </div>
        <div className="lp-feature-grid">
          {t.items.map((feature, i) => (
            <article key={feature.title} className={`lp-feature-card${i === 0 ? " is-accent is-wide" : ""}`}>
              <div className="lp-feature-icon">{FEATURE_ICONS[i]}</div>
              <small>{feature.kicker}</small>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
