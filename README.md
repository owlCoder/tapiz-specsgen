# tapiz-app-template

Starter template za Tapiz satelitske proizvode. Bazirano na `tapiz-boards` infrastrukturi —
auth, i18n, DB sloj, layout i design system su gotovi; domenski entitet (`items`) je demo
koji zamenjuješ sopstvenim.

## Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, TypeScript, **Tailwind v4**
- **MySQL + Drizzle ORM** (`mysql2`, Node runtime)
- **Auth.js v5** — credentials (email+lozinka) + opcioni Tapiz LMS SSO (kad su postavljene `LMS_*` env promenljive)
- **`@tapizlabs/ui`** design system, **Zod** za svu eksternu validaciju
- **i18n**: 5 lokaliteta (sr, sr-Cyrl, en, fr, hu)

## Arhitektura (clean architecture)

```
src/domain/          tipovi, zod šeme
src/application/     use-case servisi + repo interfejsi (ports/)
src/infrastructure/  drizzle schema, db client, repositories
src/lib/             auth, guards, server actions
src/features/        UI po funkcionalnosti (auth, settings, items)
src/app/             rute: (auth)/ (app)/ (public)/
src/app.config.ts    jedina tačka brendiranja (ime, boje, lmsClientId)
```

## Kako napraviti novi proizvod

1. Izmeni `src/app.config.ts` (ime, boje, `lmsClientId`, `productionUrl`).
2. Zameni `items` entitet sopstvenim: `schema.ts`, `domain/`, `ports/`, `repositories/`, `application/`, `actions/`, `features/`, i18n, rute.
3. Ažuriraj navigaciju u `AppShellLayout.tsx` i `PUBLIC_PATHS` u `proxy.ts`.

Detaljan vodič je u [`CLAUDE.md`](CLAUDE.md).

## Komande

```bash
npm install
npm run dev          # port 3005
npm run db:push      # drizzle šema → baza
npm run lint && npm run typecheck && npm run build
```

## Deploy

Vercel + Aiven MySQL. Env: `DATABASE_URL`, `DATABASE_SSL_CA_BASE64`, `AUTH_SECRET`,
`AUTH_TRUST_HOST=true`, opciono `LMS_*`. Health: `GET /api/health`.
