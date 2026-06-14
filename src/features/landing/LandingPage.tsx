"use client";

import "./landing.css";
import { LandingNavbar } from "./LandingNavbar";
import { LandingHero } from "./LandingHero";
import { LandingFeatures } from "./LandingFeatures";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { BackToTop } from "./BackToTop";

export function LandingPage() {
  return (
    <main className="lp-page">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingCta />
      <LandingFooter />
      <BackToTop />
    </main>
  );
}
