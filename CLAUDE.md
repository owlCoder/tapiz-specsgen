# tapiz-app-template Rules

Starter template za Tapiz satelitske proizvode. Baziran na `tapiz-boards` infrastrukturi — auth, i18n, DB sloj, layout, design system su gotovi; domenski entitet (`items`) je demo koji zamenjuješ sopstvenim.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4
- MySQL + Drizzle ORM (`mysql2`, Node runtime — NIKAD `runtime = "edge"` na kodu koji dira bazu)
- Auth.js v5: credentials (email+lozinka) + Tapiz LMS SSO (opciono, uključuje se kad su postavljene `LMS_*` env promenljive)
- `@tapizlabs/ui` design system, Zod (sva eksterna validacija)
- i18n: 5 lokaliteta (sr, sr-Cyrl, en, fr, hu), `Dict = typeof sr` je garantija kompletnosti

## Arhitektura (clean architecture — poštovati smer zavisnosti)

```
src/domain/          # tipovi, zod šeme — bez zavisnosti ka ostalim slojevima
src/application/     # use-case servisi + repo interfejsi u ports/ (DIP); baca DomainError
src/infrastructure/  # db/schema.ts + db/client.ts (lenji singleton) + repositories/
src/lib/             # auth.ts / auth.config.ts (split!), guards.ts, actions/, action-result.ts
src/features/        # UI po funkcionalnosti (auth, settings, items — zameni items sopstvenim)
src/components/      # theme/, layout/ (deljeno)
src/app/             # rute: (auth)/ login+register, (app)/ zaštićene, (public)/ status+changelog
src/proxy.ts         # Next 16 zamena za middleware — auth zaštita ruta
src/app.config.ts    # jedina tačka parametrizacije — ime, boje, lmsClientId, verzija
```

- Server actions: zod parse → guard → application servis → `revalidatePath`. Vraćaju `ActionResult<T>` — nikad ne bacaju ka klijentu.
- Autorizacija uvek na serveru: svaki action zove `requireUser()` / `requireAdmin()` iz `lib/guards.ts`.
- Poslovna pravila žive u `application/` servisima, ne u akcijama ni komponentama.

## Kako koristiti template za novi proizvod

1. **`src/app.config.ts`** — promeni `name`, `shortName`, `description`, `accentColor`, `lmsClientId`, `productionUrl`.
2. **`src/infrastructure/db/schema.ts`** — zameni/proširi `items` tabelu sopstvenim entitetima.
3. **`src/domain/`** — dodaj tipove i Zod šeme za novi domen (zadrži `user.types.ts`).
4. **`src/application/ports/`** — definiši repo interfejse za nove entitete (zadrži `users.port.ts`, `events.port.ts`).
5. **`src/infrastructure/repositories/`** — implementiraj repoe (zadrži `users.repo.ts`, `events.repo.ts`).
6. **`src/application/`** — napiši servise (zadrži `users.service.ts`, `sso.service.ts`, `events.service.ts`).
7. **`src/lib/actions/`** — dodaj server akcije za novi domen (zadrži `auth.actions.ts`, `profile.actions.ts`).
8. **`src/features/`** — zameni `items/` sopstvenim feature-ima; `auth/` i `settings/` ostaju.
9. **`src/i18n/dictionaries/sr.ts`** — dodaj sekcije za novi domen, obriši `items` sekciju; ostali jezici prate istu šemu.
10. **`src/app/(app)/`** — dodaj stranice; zameni `/items` sopstvenim rutama.
11. **`src/components/layout/AppShellLayout.tsx`** — ažuriraj navigacione linkove.
12. **`src/proxy.ts`** — ažuriraj `PUBLIC_PATHS` ako dodaješ javne rute.

## Kritične začkoljice

- **`@source "../../node_modules/@tapizlabs/ui/dist/index.js"` u globals.css je OBAVEZAN** — komponente design systema nose Tailwind klase u dist bundle-u; bez ovoga su "gole".
- `@tapizlabs/ui` bundle NEMA `"use client"` — stateful komponente (modali, Switch, Tabs, useToast...) koristiti samo unutar client komponenti.
- Auth.js split config: `src/lib/auth.config.ts` je edge-safe (koristi ga proxy) — NE importovati bcrypt/mysql2/repoe u njega.
- Next 16: `params`/`searchParams` su `Promise` — `await params`.
- Drizzle klijent je lenji Proxy (`src/infrastructure/db/client.ts`) da build prolazi bez `DATABASE_URL`.
- `Badge` varijante: `default|success|warning|danger|info|muted`. `Button` ikone prosleđivati kao element: `icon={<Plus size={16} />}`.
- Role su `"admin" | "user"` (ne boards-ove `"assistant" | "student"`). LMS SSO mapira: `student → "user"`, `assistant → "admin"`.
- Reset stanja modala pri otvaranju radi se **tokom rendera** (prevOpen šablon iz React docs), ne kroz `useEffect`.

## Komande

```bash
npm install                  # instalacija zavisnosti
npm run dev                  # lokalni razvoj (port 3005)
npm run db:push              # drizzle šema → baza (interaktivno, nikad --force)
npm run lint && npm run typecheck && npm run build   # provera pre završetka taska
npx tsx --env-file=.env scripts/smoke.ts             # smoke test poslovne logike (traži bazu)
```

## Deploy (Vercel + Aiven MySQL)

- Env: `DATABASE_URL`, `DATABASE_SSL_CA_BASE64` (base64 Aiven `ca.pem`), `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, opciono 4 `LMS_*` promenljive.
- `DATABASE_SSL_CA_BASE64` aktivira TLS ka Aivenu u `db/client.ts` (mysql2 `ssl: { ca, rejectUnauthorized: true }`).
- Health endpoint: `GET /api/health`.
- Za `db:push` ka Aivenu sa lokalne mašine: URL-u dodati `?ssl={"rejectUnauthorized":false}`.
