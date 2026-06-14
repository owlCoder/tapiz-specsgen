"use client";

import { Check, MockupFrame } from "@tapizlabs/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { Eyebrow } from "./primitives/Eyebrow";
import { LandingButton } from "./primitives/LandingButton";

export function LandingHero() {
  const { dict } = useI18n();
  const t = dict.landing.hero;

  const metrics = [
    { value: "Auth.js", label: t.metricAuth },
    { value: "Drizzle", label: t.metricOutput },
    { value: "i18n", label: t.metricTemplates },
  ];

  return (
    <section className="lp-hero" id="templates">
      <div className="lp-hero-grid" aria-hidden="true" />
      <div className="lp-orb lp-orb-a" aria-hidden="true" />
      <div className="lp-orb lp-orb-b" aria-hidden="true" />

      <div className="lp-container lp-hero-layout">
        <div className="lp-hero-copy">
          <div className="lp-hero-badge">
            <span />
            {t.badge}
          </div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1>
            {t.headline1}
            <br />
            {t.headline2}
            <br />
            <span style={{ color: "var(--lp-accent)" }}>{t.headline3}</span>
          </h1>
          <p>{t.description}</p>
          <div className="lp-hero-actions">
            <LandingButton href="/register">{t.ctaRegister}</LandingButton>
            <LandingButton href="/login" variant="secondary">
              {t.ctaLogin}
            </LandingButton>
          </div>
          <div className="lp-hero-stats">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
          <div className="lp-trust-strip">
            {t.trustPoints.map((point) => (
              <span key={point}>
                <Check size={13} />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="lp-dashboard-wrap">
          <MockupFrame title={t.mockupTitle}>
            <div className="lp-spec-doc">
              <div className="lp-spec-hero">
                <strong>{t.mockupDocTitle}</strong>
                <span>{t.mockupDocSubtitle}</span>
              </div>
              <div className="lp-spec-section">
                <small>{t.mockupSection1}</small>
                <div className="lp-spec-line" />
                <div className="lp-spec-line is-short" />
              </div>
              <div className="lp-spec-section">
                <small>{t.mockupSection2}</small>
                <ul>
                  <li>{t.mockupItem1}</li>
                  <li>{t.mockupItem2}</li>
                  <li>{t.mockupItem3}</li>
                </ul>
              </div>
              <div className="lp-spec-swatches" aria-hidden="true">
                <span style={{ background: "var(--lp-accent)" }} />
                <span style={{ background: "var(--lp-signal)" }} />
                <span style={{ background: "var(--lp-good)" }} />
                <span style={{ background: "var(--color-warn)" }} />
              </div>
            </div>
          </MockupFrame>
        </div>
      </div>
    </section>
  );
}
