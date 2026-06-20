"use client";

import {
  Button,
  ChevronDown,
  FieldLabel,
  Input,
  Plus,
  Select,
  Surface,
  Switch,
  Textarea,
  Trash,
  X,
} from "@tapizlabs/ui";
import type { Course, Deliverable, GradingItem, Module, Scenario } from "../types/spec.types";
import { uid } from "../lib/uid";

function Section({
  title,
  hint,
  open,
  children,
}: {
  title: string;
  hint?: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Surface variant="raised" padding="none">
      <details open={open}>
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3">
          <span className="font-display text-sm font-semibold text-(--tapiz-text-primary)">
            {title}
          </span>
          <ChevronDown size={15} className="text-(--tapiz-text-muted)" />
        </summary>
        <div className="border-t border-(--tapiz-border-subtle) px-4 pb-4 pt-3">
          {hint && (
            <p className="mb-3 text-xs text-(--tapiz-text-muted)">{hint}</p>
          )}
          <div className="space-y-3">{children}</div>
        </div>
      </details>
    </Surface>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1">{children}</div>
    </div>
  );
}

interface Props {
  editing: Course;
  setEditing: (c: Course) => void;
}

export function Editor({ editing, setEditing }: Props) {
  const up = (p: Partial<Course>) => setEditing({ ...editing, ...p });
  const upTS = (p: Partial<Course["techStack"]>) =>
    setEditing({ ...editing, techStack: { ...editing.techStack, ...p } });

  const modUp = (i: number, p: Partial<Module>) =>
    up({ modules: editing.modules.map((m, j) => (j === i ? { ...m, ...p } : m)) });

  const scUp = (i: number, p: Partial<Scenario>) =>
    up({ scenarios: editing.scenarios.map((s, j) => (j === i ? { ...s, ...p } : s)) });

  const entUp = (i: number, j: number, p: Partial<Scenario["entiteti"][0]> | null) => {
    if (p === null) {
      scUp(i, { entiteti: editing.scenarios[i].entiteti.filter((_, k) => k !== j) });
      return;
    }
    scUp(i, {
      entiteti: editing.scenarios[i].entiteti.map((e, k) => (k === j ? { ...e, ...p } : e)),
    });
  };

  const atrUp = (
    i: number,
    j: number,
    k: number,
    p: Partial<Scenario["entiteti"][0]["atributi"][0]>,
  ) =>
    entUp(i, j, {
      atributi: editing.scenarios[i].entiteti[j].atributi.map((a, l) =>
        l === k ? { ...a, ...p } : a,
      ),
    });

  const listAdd = <K extends "nonFunctional" | "deliverables" | "grading">(
    key: K,
    val: Course[K][number],
  ) => up({ [key]: [...(editing[key] as unknown[]), val] } as Partial<Course>);

  const listSet = <K extends "nonFunctional" | "deliverables" | "grading">(
    key: K,
    i: number,
    val: Course[K][number],
  ) =>
    up({
      [key]: (editing[key] as unknown[]).map((x, j) => (j === i ? val : x)),
    } as Partial<Course>);

  const listDel = <K extends "nonFunctional" | "deliverables" | "grading">(key: K, i: number) =>
    up({ [key]: (editing[key] as unknown[]).filter((_, j) => j !== i) } as Partial<Course>);

  return (
    <div className="space-y-3">
        {/* Osnovni podaci */}
        <Section title="Osnovni podaci" open>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Field label="Naziv">
                <Input
                  value={editing.name}
                  onChange={(e) => up({ name: e.target.value })}
                  placeholder="npr. Osnove distribuiranog programiranja"
                />
              </Field>
            </div>
            <Field label="Skraćenica">
              <Input
                value={editing.abbr}
                onChange={(e) => up({ abbr: e.target.value })}
                placeholder="ODP"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Godina">
              <Input
                type="number"
                value={String(editing.yearOfStudy)}
                onChange={(e) => up({ yearOfStudy: +e.target.value })}
              />
            </Field>
            <Field label="Semestar">
              <Input
                type="number"
                value={String(editing.semester)}
                onChange={(e) => up({ semester: +e.target.value })}
              />
            </Field>
            <Field label="Tip">
              <Select
                value={editing.projectType}
                onChange={(e) => up({ projectType: e.target.value as "timski" | "individualni" })}
              >
                <option value="timski">timski</option>
                <option value="individualni">individualni</option>
              </Select>
            </Field>
            <Field label="Vel. tima">
              <Input
                type="number"
                value={String(editing.teamSize)}
                disabled={editing.projectType === "individualni"}
                onChange={(e) => up({ teamSize: +e.target.value })}
              />
            </Field>
          </div>
          <Field label="Opis (opciono — ako prazno koristi se scenario)">
            <Textarea
              value={editing.description}
              onChange={(e) => up({ description: e.target.value })}
              rows={2}
            />
          </Field>
        </Section>

        {/* Tehnološki stack */}
        <Section title="Tehnološki stack">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Jezik"><Input value={editing.techStack.jezik} onChange={(e) => upTS({ jezik: e.target.value })} /></Field>
            <Field label="Backend"><Input value={editing.techStack.backend} onChange={(e) => upTS({ backend: e.target.value })} /></Field>
            <Field label="Frontend"><Input value={editing.techStack.frontend} onChange={(e) => upTS({ frontend: e.target.value })} /></Field>
            <Field label="Baza"><Input value={editing.techStack.baza} onChange={(e) => upTS({ baza: e.target.value })} /></Field>
            <div className="sm:col-span-2">
              <Field label="Ostalo"><Input value={editing.techStack.ostalo} onChange={(e) => upTS({ ostalo: e.target.value })} /></Field>
            </div>
          </div>
          <div className="flex items-center justify-between rounded border border-(--tapiz-border-subtle) p-3">
            <span className="text-sm font-medium text-(--tapiz-text-primary)">Koristi Agile board</span>
            <Switch
              checked={editing.usesAgileBoard}
              onChange={(v) => up({ usesAgileBoard: v })}
            />
          </div>
          {editing.usesAgileBoard && (
            <Field label="Alat">
              <Input
                placeholder="Jira / Trello / GitHub Projects"
                value={editing.agileTool}
                onChange={(e) => up({ agileTool: e.target.value })}
              />
            </Field>
          )}
        </Section>

        {/* Moduli */}
        <Section
          title={`Moduli / zahtevi (${editing.modules.length})`}
          hint="Obavezni uvek ulaze; iz izbornih se nasumično bira zadati broj."
        >
          {editing.modules.map((m, i) => (
            <div key={m.id} className="space-y-2 rounded border border-(--tapiz-border-subtle) p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="naziv modula"
                  value={m.naziv}
                  onChange={(e) => modUp(i, { naziv: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash size={14} />}
                  onClick={() => up({ modules: editing.modules.filter((_, j) => j !== i) })}
                />
              </div>
              <Textarea
                placeholder="opis zahteva"
                value={m.opis}
                onChange={(e) => modUp(i, { opis: e.target.value })}
                rows={2}
              />
              <div className="flex items-center gap-3">
                <Input
                  placeholder="kategorija"
                  value={m.kategorija}
                  onChange={(e) => modUp(i, { kategorija: e.target.value })}
                  className="max-w-40"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={m.mandatory}
                    onChange={(v) => modUp(i, { mandatory: v })}
                  />
                  <span className="text-xs text-(--tapiz-text-muted)">obavezan</span>
                </div>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            icon={<Plus size={14} />}
            onClick={() =>
              up({ modules: [...editing.modules, { id: uid(), naziv: "", opis: "", kategorija: "", mandatory: false }] })
            }
          >
            Dodaj modul
          </Button>
        </Section>

        {/* Scenariji */}
        <Section
          title={`Scenariji / domeni (${editing.scenarios.length})`}
          hint={'Entiteti označeni „izborni" se nasumično uključuju. Isto važi za atribute.'}
        >
          {editing.scenarios.map((s, i) => (
            <div key={s.id} className="space-y-2 rounded border border-(--tapiz-border-subtle) p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="naziv scenarija"
                  value={s.naziv}
                  onChange={(e) => scUp(i, { naziv: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash size={14} />}
                  onClick={() => up({ scenarios: editing.scenarios.filter((_, j) => j !== i) })}
                />
              </div>
              <Textarea
                placeholder="opis"
                value={s.opis}
                onChange={(e) => scUp(i, { opis: e.target.value })}
                rows={2}
              />
              <div className="space-y-2 border-l-2 border-(--tapiz-border-subtle) pl-3">
                {s.entiteti.map((e, j) => (
                  <div key={j} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="entitet"
                        value={e.naziv}
                        onChange={(ev) => entUp(i, j, { naziv: ev.target.value })}
                      />
                      <div className="flex shrink-0 items-center gap-1">
                        <Switch
                          checked={e.optional}
                          onChange={(v) => entUp(i, j, { optional: v })}
                        />
                        <span className="text-xs text-(--tapiz-text-muted)">izb.</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<X size={13} />}
                        onClick={() => entUp(i, j, null)}
                      />
                    </div>
                    {e.atributi.map((a, k) => (
                      <div key={k} className="flex items-center gap-1.5 pl-3">
                        <Input
                          placeholder="atribut"
                          value={a.naziv}
                          onChange={(ev) => atrUp(i, j, k, { naziv: ev.target.value })}
                        />
                        <Input
                          placeholder="tip"
                          value={a.tip}
                          onChange={(ev) => atrUp(i, j, k, { tip: ev.target.value })}
                          className="max-w-24"
                        />
                        <Switch
                          checked={a.optional}
                          onChange={(v) => atrUp(i, j, k, { optional: v })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<X size={12} />}
                          onClick={() =>
                            entUp(i, j, { atributi: e.atributi.filter((_, l) => l !== k) })
                          }
                        />
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Plus size={12} />}
                      onClick={() =>
                        entUp(i, j, { atributi: [...e.atributi, { naziv: "", tip: "", optional: false }] })
                      }
                    >
                      atribut
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Plus size={13} />}
                  onClick={() =>
                    scUp(i, { entiteti: [...s.entiteti, { naziv: "", optional: false, atributi: [] }] })
                  }
                >
                  entitet
                </Button>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            icon={<Plus size={14} />}
            onClick={() =>
              up({ scenarios: [...editing.scenarios, { id: uid(), naziv: "", opis: "", entiteti: [] }] })
            }
          >
            Dodaj scenario
          </Button>
        </Section>

        {/* Varijacija */}
        <Section title="Varijacija (sprečavanje prepisivanja)">
          <Field label="Broj izbornih modula koji se nasumično biraju">
            <Input
              type="number"
              value={String(editing.optionalCount)}
              onChange={(e) => up({ optionalCount: +e.target.value })}
              className="max-w-28"
            />
          </Field>
          <div className="grid max-w-xs grid-cols-2 gap-3">
            <Field label="Izbornih entiteta: od">
              <Input type="number" value={String(editing.entityVarMin)} onChange={(e) => up({ entityVarMin: +e.target.value })} />
            </Field>
            <Field label="do">
              <Input type="number" value={String(editing.entityVarMax)} onChange={(e) => up({ entityVarMax: +e.target.value })} />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded border border-(--tapiz-border-subtle) p-3">
            <span className="text-sm font-medium text-(--tapiz-text-primary)">Različita varijanta po grupi</span>
            <Switch checked={editing.varyByTeam} onChange={(v) => up({ varyByTeam: v })} />
          </div>
          {editing.varyByTeam && (
            <Field label="Broj grupa">
              <Input
                type="number"
                value={String(editing.numTeams)}
                onChange={(e) => up({ numTeams: +e.target.value })}
                className="max-w-28"
              />
            </Field>
          )}
        </Section>

        {/* Nefunkcionalni, rokovi, ocenjivanje */}
        <Section title="Nefunkcionalni zahtevi, rokovi, ocenjivanje">
          <div>
            <p className="mb-2 text-xs font-medium text-(--tapiz-text-muted)">Nefunkcionalni zahtevi</p>
            <div className="space-y-2">
              {editing.nonFunctional.map((x, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={x} onChange={(e) => listSet("nonFunctional", i, e.target.value)} />
                  <Button size="sm" variant="ghost" icon={<Trash size={14} />} onClick={() => listDel("nonFunctional", i)} />
                </div>
              ))}
            </div>
            <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => listAdd("nonFunctional", "")} className="mt-2">
              Dodaj
            </Button>
          </div>

          <div className="border-t border-(--tapiz-border-subtle) pt-3">
            <p className="mb-2 text-xs font-medium text-(--tapiz-text-muted)">Predaja i rokovi</p>
            <div className="space-y-2">
              {editing.deliverables.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="stavka" value={d.naziv} onChange={(e) => listSet("deliverables", i, { ...d, naziv: e.target.value } as Deliverable)} />
                  <Input placeholder="rok" value={d.rok} onChange={(e) => listSet("deliverables", i, { ...d, rok: e.target.value } as Deliverable)} />
                  <Button size="sm" variant="ghost" icon={<Trash size={14} />} onClick={() => listDel("deliverables", i)} />
                </div>
              ))}
            </div>
            <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => listAdd("deliverables", { naziv: "", rok: "" } as Deliverable)} className="mt-2">
              Dodaj rok
            </Button>
          </div>

          <div className="border-t border-(--tapiz-border-subtle) pt-3">
            <p className="mb-2 text-xs font-medium text-(--tapiz-text-muted)">Ocenjivanje</p>
            <div className="space-y-2">
              {editing.grading.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="stavka" value={g.stavka} onChange={(e) => listSet("grading", i, { ...g, stavka: e.target.value } as GradingItem)} />
                  <Input type="number" placeholder="poeni" value={String(g.poeni)} onChange={(e) => listSet("grading", i, { ...g, poeni: +e.target.value } as GradingItem)} className="max-w-24" />
                  <Button size="sm" variant="ghost" icon={<Trash size={14} />} onClick={() => listDel("grading", i)} />
                </div>
              ))}
            </div>
            <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => listAdd("grading", { stavka: "", poeni: 0 } as GradingItem)} className="mt-2">
              Dodaj stavku
            </Button>
          </div>

          <div className="border-t border-(--tapiz-border-subtle) pt-3">
            <p className="mb-2 text-xs font-medium text-(--tapiz-text-muted)">Napomene</p>
            <Textarea value={editing.notes} onChange={(e) => up({ notes: e.target.value })} rows={3} />
          </div>
        </Section>
    </div>
  );
}
