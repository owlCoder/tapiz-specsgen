/**
 * Parametrizovana konfiguracija aplikacije.
 *
 * Kada kreneš novi proizvod sa ovog template-a:
 * 1. Promeni sve vrednosti ovde (nema find & replace po celoj bazi koda).
 * 2. Postavi env varijable u .env (kopiraj .env.example).
 * 3. Dodaj OAuth klijent u LMS OAUTH_CLIENTS ako koristiš SSO.
 */
const appConfig = {
  /** Puno ime aplikacije — prikazuje se u naslovu, landingu, settingsima. */
  name: "Tapiz App",

  /** Kratko ime / brand — sidebar, meta tagovi. */
  shortName: "Tapiz",

  /** Opis za meta description i landing stranicu. */
  description: "Starter template za Tapiz satelitske proizvode.",

  /** Verzija — prikazuje se u settings → info sekciji. */
  version: "0.1.0",

  /** Datum poslednjeg ažuriranja za info sekciju. */
  lastUpdate: "Jun 2026.",

  /** Autor za info sekciju. */
  author: "Tapiz Labs",

  /** Produkcioni URL — koristi se u meta tagovima i share linkovima. */
  productionUrl: "https://your-app.vercel.app",

  /**
   * Boja akcenta. Mora biti Tailwind klasa koja postoji u paleti
   * ili CSS custom property iz design systema.
   * Primer: "violet", "blue", "emerald"
   */
  accentColor: "violet",

  /** LMS OAuth client ID koji ova aplikacija koristi (vrednost LMS_OAUTH_CLIENT_ID env var). */
  lmsClientId: "tapiz-app-template",
} as const;

export default appConfig;
