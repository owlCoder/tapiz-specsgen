"use client";

import { Badge, Surface } from "@tapizlabs/ui";
import type { AppSettings, Course, ResolvedVariant } from "../types/spec.types";

function Sec({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 border-b border-(--tapiz-border-subtle) pb-1 font-display text-sm font-semibold text-(--tapiz-text-primary)">
        {n}. {title}
      </h3>
      <div className="text-sm text-(--tapiz-text-secondary)">{children}</div>
    </div>
  );
}

interface Props {
  course: Course;
  settings: AppSettings;
  variant: ResolvedVariant;
}

export function Preview({ course: c, settings: s, variant: v }: Props) {
  const total = c.grading.reduce((a, g) => a + (+g.poeni || 0), 0);
  const ts = (
    [
      ["Programski jezik", c.techStack.jezik],
      ["Backend", c.techStack.backend],
      ["Frontend", c.techStack.frontend],
      ["Baza", c.techStack.baza],
      ["Ostalo", c.techStack.ostalo],
    ] as [string, string][]
  ).filter(([, x]) => x?.trim() && x.trim() !== "—");

  return (
    <Surface variant="raised" padding="md" className="leading-relaxed">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-(--tapiz-text-primary)">
            {c.name}
            {c.abbr && (
              <span className="ml-2 font-normal text-(--tapiz-text-muted)">({c.abbr})</span>
            )}
          </h1>
          <p className="mt-0.5 text-sm text-(--tapiz-text-muted)">
            Specifikacija projektnog zadatka
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="muted">{s.academicYear}</Badge>
          {c.varyByTeam && <Badge variant="info">Grupa {v.teamIndex + 1}</Badge>}
          <Badge variant="default">
            <span className="font-mono">{v.code}</span>
          </Badge>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
        <span><span className="font-medium text-(--tapiz-text-primary)">Fakultet:</span> {s.faculty}</span>
        <span><span className="font-medium text-(--tapiz-text-primary)">Godina:</span> {c.yearOfStudy}. / {c.semester}. sem.</span>
        <span>
          <span className="font-medium text-(--tapiz-text-primary)">Tip:</span>{" "}
          {c.projectType === "timski" ? `timski (do ${c.teamSize})` : "individualni"}
        </span>
      </div>

      <Sec n="1" title="Opis projekta">
        <p>
          {c.description?.trim() || (
            <>
              Razvija se aplikacija na temu:{" "}
              <strong className="text-(--tapiz-text-primary)">
                {v.scenario ? v.scenario.naziv : "zadatu temu"}
              </strong>
              {v.scenario?.opis ? `. ${v.scenario.opis}` : "."}
            </>
          )}
        </p>
      </Sec>

      <Sec n="2" title="Tehnološki stack">
        <table className="w-full">
          <tbody>
            {ts.map(([k, x]) => (
              <tr key={k} className="border-b border-(--tapiz-border-subtle)">
                <td className="w-40 py-1 pr-4 font-medium text-(--tapiz-text-primary)">{k}</td>
                <td className="py-1">{x}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sec>

      <Sec n="3" title="Metodologija rada">
        {c.usesAgileBoard ? (
          <p>
            Agile uz obaveznu Agile tablu (
            <strong className="text-(--tapiz-text-primary)">{c.agileTool || "Agile board"}</strong>
            ): sprintovi, user stories, raspodela i praćenje.
          </p>
        ) : (
          <p>Fazni razvoj uz jasnu raspodelu i poštovanje rokova.</p>
        )}
      </Sec>

      <Sec n="4" title="Domenski model">
        {v.entities?.length ? (
          v.entities.map((e, i) => (
            <div key={i} className="mb-1">
              <strong className="text-(--tapiz-text-primary)">{e.naziv}</strong>{" "}
              <span>— {e.atributi.map((a) => `${a.naziv}: ${a.tip}`).join(", ")}</span>
            </div>
          ))
        ) : (
          <p className="text-(--tapiz-text-muted)">Nema entiteta.</p>
        )}
      </Sec>

      <Sec n="5" title="Funkcionalni zahtevi">
        <p>
          Obavezna je potpuna <strong className="text-(--tapiz-text-primary)">CRUD</strong>{" "}
          funkcionalnost nad svim entitetima domena, uz validaciju. Pored toga:
        </p>
        <ol className="mt-2 space-y-1.5">
          {v.modules.map((m, i) => (
            <li key={m.id}>
              <strong className="text-(--tapiz-text-primary)">5.{i + 1} {m.naziv}</strong>
              {!m.mandatory && (
                <Badge variant="muted" className="ml-1.5">izborni</Badge>
              )}
              {m.opis && <div className="mt-0.5 text-(--tapiz-text-muted)">{m.opis}</div>}
            </li>
          ))}
        </ol>
      </Sec>

      {c.nonFunctional?.length > 0 && (
        <Sec n="6" title="Nefunkcionalni zahtevi">
          <ul className="ml-5 list-disc space-y-0.5">
            {c.nonFunctional.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </Sec>
      )}

      {c.deliverables?.length > 0 && (
        <Sec n="7" title="Predaja i rokovi">
          <table className="w-full">
            <tbody>
              {c.deliverables.map((d, i) => (
                <tr key={i} className="border-b border-(--tapiz-border-subtle)">
                  <td className="py-1 pr-4">{d.naziv}</td>
                  <td className="py-1 text-(--tapiz-text-muted)">{d.rok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sec>
      )}

      {c.grading?.length > 0 && (
        <Sec n="8" title="Kriterijumi ocenjivanja">
          <table className="w-full">
            <tbody>
              {c.grading.map((g, i) => (
                <tr key={i} className="border-b border-(--tapiz-border-subtle)">
                  <td className="py-1 pr-4">{g.stavka}</td>
                  <td className="w-16 py-1 text-right">{g.poeni}</td>
                </tr>
              ))}
              <tr className="font-semibold text-(--tapiz-text-primary)">
                <td className="py-1 pr-4">Ukupno</td>
                <td className="py-1 text-right">{total}</td>
              </tr>
            </tbody>
          </table>
        </Sec>
      )}

      {s.integrityNote && (
        <Sec n="9" title="Akademska čestitost">
          <p>
            Svaka grupa i generacija ima jedinstvenu varijantu (
            <span className="font-mono text-(--tapiz-text-primary)">{v.code}</span>).
            Preuzimanje ranijih/tuđih rešenja je uočljivo i tretira se kao prepisivanje.
          </p>
        </Sec>
      )}

      {c.notes?.trim() && (
        <Sec n="10" title="Napomene">
          <p className="whitespace-pre-wrap">{c.notes}</p>
        </Sec>
      )}
    </Surface>
  );
}
