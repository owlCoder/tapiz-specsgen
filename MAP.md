# tapiz-specgen — Map

> Per-repo navigation map. Read this before exploring. See `CLAUDE.md` for rules.

## Structure

- **Features** (3): `specgen`, `auth`, `settings`
- **App routes** (4): `(app)`, `(auth)`, `(public)`, `api`
- **DB tabele** (6): `app_settings`, `courses`, `archive_entries`, `archive_variants`, `users`, `app_events`

## Where to look

| Task | Start here |
|---|---|
| Dodati polje na predmet | `spec.types.ts` → `schema.ts` → `courses.repo.ts` → `Editor.tsx` |
| Promeniti generisanje varijanti | `features/specgen/lib/variant.ts` |
| Promeniti seed predmete | `features/specgen/lib/seed.ts` |
| Nova server akcija | `src/lib/actions/` + port u `application/ports/` |
| Promeni što vidi asistent | `SpecGenApp.tsx` (routing state) ili podkomponente |
| Auth pravila | `src/lib/auth.ts` → `signIn` callback |
| Postavke (fakultet, godina) | `SettingsView.tsx` → `settings.actions.ts` → `settings.service.ts` |
| Arhiva generisanih specifikacija | `ArchiveView.tsx` → `archive.actions.ts` → `archive.service.ts` |
| DB migracija | `npm run db:push` (drizzle push) |
| Dodati novi jezik | `src/i18n/dictionaries/` — kopirati `sr.ts`, prepisati vrednosti |
