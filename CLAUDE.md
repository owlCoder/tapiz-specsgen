# tapiz-specsgen Rules

Generator specifikacija projektnih zadataka za nastavnike i asistente. Samo `assistant` LMS rola ima pristup. Bez localStorage — svi podaci u MySQL.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4
- MySQL + Drizzle ORM (`mysql2`, Node runtime — NIKAD `runtime = "edge"` na kodu koji dira bazu)
- Auth.js v5: **isključivo Tapiz LMS SSO** (nema credentials prijave, nema registracije)
- `lucide-react` za ikone (dodat ručno — nije u template-u)
- `@tapizlabs/ui@^0.2.30` (još uvek pre-2.0 — repo NIJE migriran na Brand 2.0 "Ink & Ember"/skinove; migracija pri sledećem UI zahvatu)
- **`@tapizlabs/app-kit`** — `ActionResult`/`ok`/`fail`/`isOk` (re-export iz `src/lib/action-result.ts`)
- **`@tapizlabs/identity/sso`** — `tapizLmsProvider`, `isLmsSsoEnabled`
- i18n: 5 lokaliteta (sr, sr-Cyrl, en, fr, hu), `Dict = typeof sr` garantija kompletnosti

## Arhitektura

```
src/domain/          # tipovi, zod šeme
src/application/     # servisi + ports/ (DIP)
  courses.service.ts      # seedIfEmpty() pri prvom startovanju
  settings.service.ts     # getOrCreate() — singleton red id='1'
  archive.service.ts      # create() + getAll() + delete()
src/infrastructure/
  db/schema.ts            # app_settings, courses, archive_entries, archive_variants, users, app_events
  repositories/
    courses.repo.ts       # mapRow() konvertuje tinyint→boolean, JSON kolone
    settings.repo.ts      # upsert pattern
    archive.repo.ts       # transakcija entry+variants, cascade delete
src/lib/
  auth.ts                 # SAMO lmsProvider, blokira student rolu u signIn callback-u
  guards.ts               # requireAdmin()
  actions/
    courses.actions.ts    # getCoursesAction, createCourseAction, updateCourseAction, deleteCourseAction
    settings.actions.ts   # getSettingsAction, updateSettingsAction
    archive.actions.ts    # getArchiveAction, createArchiveEntryAction, deleteArchiveEntryAction
src/features/specsgen/
  types/spec.types.ts     # Course, Module, Scenario, Entitet, AppSettings, ArchiveEntry...
  lib/
    variant.ts            # deterministička generacija varijanti (hashStr + mulberry32 seeded RNG)
    seed.ts               # SEED_COURSES (ODP, OIB, ERS), SEED_SETTINGS
    uid.ts                # uid() wrapper
  components/
    SpecGenApp.tsx         # "use client" — glavni state, routing između viewova
    Listing.tsx / Editor.tsx / Generate.tsx / Preview.tsx / ArchiveView.tsx / SettingsView.tsx
src/app/(app)/page.tsx    # server: requireAdmin → seedIfEmpty → učitaj sve → <SpecGenApp>
src/proxy.ts              # zaštita ruta (/ je zaštićen, ne u PUBLIC_PATHS)
```

## Auth pravila

- Jedini provider: `tapizLmsProvider` iz `@tapizlabs/identity/sso`
- U `signIn` callback-u: odbija se svako ko nije `assistant` (mapira na `"admin"`)
- `student` rola → redirect `/login?error=lms-role`
- Bez LMS env promenljivih → SSO dugme se ne prikazuje (lokalni dev)
- Nema credentials prijave, samostalne registracije ni `/register` rute

## DB šema — ključne napomene

- `courses` ima JSON kolone (`modules`, `scenarios`, `non_functional`, `deliverables`, `grading`, `tech_stack`) — menjati samo kroz `.$type<T>()` castove
- `tinyint` za booleane (MySQL nema native bool) — `mapRow()` u courses.repo.ts konvertuje na `boolean`
- `archive_variants.entry_id` → FK sa `ON DELETE CASCADE`
- `app_settings` uvek ima tačno jedan red (id='1') — koristiti `getOrCreate()`/`upsert`

## SpecGenApp pattern

Server page učitava sve podatke i prosleđuje kao props. Client state se inicijalizuje iz props — **bez useEffect za inicijalni load**. Mutacije pozivaju server akcije, pa optimistički ažuriraju lokalni state.

`ActionResult<T>` narrowing: uvek ekstraktovati `result.data` u lokalnu promenljivu PRE korišćenja u setState callback-u:
```ts
const result = await createCourseAction(input);
if (!result.ok) return;
const created = result.data;   // <-- ekstraktovati ovde
setCourses(p => [...p, created]);
```

## Komande

```bash
npm install                  # instalacija
npm run dev                  # lokalni razvoj (port 3006)
npm run db:push              # drizzle šema → baza
npm run lint && npm run typecheck && npm run build   # provera pre završetka
```

## Lokalni Docker setup

```
MySQL kontejner: tapiz-hub-mysql (port 3311)
Baza: tapiz_specsgen
Korisnik: root / root
DATABASE_URL="mysql://root:root@localhost:3311/tapiz_specsgen"
```

## Deploy (Vercel + Aiven MySQL)

- Env: `DATABASE_URL`, `DATABASE_SSL_CA_BASE64`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, 4x `LMS_*`
- Health endpoint: `GET /api/health`
