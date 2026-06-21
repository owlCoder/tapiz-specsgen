# Tapiz Specs (`tapiz-specsgen`)

Generator specifikacija projektnih zadataka za nastavnike i asistente. Iz definicije
predmeta (moduli, scenariji, entiteti, nefunkcionalni zahtevi, način ocenjivanja)
deterministički generiše **personalizovane varijante** zadataka po studentu i izvozi ih
u PDF. Svi podaci žive u MySQL — bez `localStorage`.

**Pristup:** isključivo `assistant` LMS rola, preko Tapiz LMS SSO. Studenti i ostale role
se odbijaju. (Distinct od `tapiz-specs` proizvoda — ovo je interni alat za *generisanje*.)

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 ·
MySQL + Drizzle ORM (`mysql2`, Node runtime) · Auth.js v5 (samo Tapiz LMS SSO) ·
`@tapizlabs/ui` · `@tapizlabs/identity/sso` · `@tapizlabs/app-kit` · Zod.
i18n: 5 lokaliteta (sr, sr-Cyrl, en, fr, hu).

## Arhitektura (clean architecture)

```
src/domain/          tipovi, zod šeme
src/application/      use-case servisi + repo interfejsi (ports/)
src/infrastructure/  drizzle schema, db client, repositories
src/lib/             auth, guards, server actions
src/features/        UI po funkcionalnosti (specsgen, auth, settings, landing)
src/app/             rute: (auth)/ (app)/ (public)/
src/app.config.ts    jedina tačka brendiranja (ime, accentColor, lmsClientId, productionUrl)
```

Detaljan vodič i pravila: [`CLAUDE.md`](CLAUDE.md). Navigaciona mapa: [`MAP.md`](MAP.md).

## Lokalni razvoj

```bash
npm install
# Docker MySQL (port 3311 da se ne sudara sa drugim Tapiz bazama):
docker run -d --name tapiz-hub-mysql -p 3311:3306 \
  -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=tapiz_specsgen mysql:8.4
cp .env.example .env        # popuni AUTH_SECRET (openssl rand -base64 32), LMS_*
npm run db:push             # kreira tabele (drizzle push)
npm run dev                 # http://localhost:3006
```

Bez `LMS_*` env promenljivih SSO dugme se ne prikazuje — lokalni dev radi i bez LMS-a
(ali pristup `/app` zahteva prijavu, pa za pun tok podesi SSO ka lokalnom LMS-u).

## SSO (Tapiz LMS)

OAuth klijent `tapiz-specsgen` mora biti registrovan u `tapiz-rest-api` `OAUTH_CLIENTS`
sa `redirect_uris: ["https://tapiz-specsgen.vercel.app/api/auth/callback/tapiz-lms"]`.
Vidi `.env.example` za pun spisak `LMS_*` promenljivih.

## Provere

```bash
npm run lint && npm run typecheck && npm run build
```

## Deploy (Vercel + Aiven MySQL)

Env: `DATABASE_URL`, `DATABASE_SSL_CA_BASE64`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`,
4× `LMS_*`. Health endpoint: `GET /api/health`. Prod: `https://tapiz-specsgen.vercel.app`.
