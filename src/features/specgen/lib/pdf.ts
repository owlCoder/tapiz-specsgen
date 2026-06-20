/**
 * Lokalni MD → PDF (izuzetak: u specgenu PDF se renderuje lokalno, ne preko Tapiz PDF API-ja).
 *
 * Dva ulaza:
 *  1. `printSpecPdf(course, settings, variant)` — generiše PROFESIONALAN akademski dokument
 *     direktno iz strukturisanih podataka: naslovna strana, fakultetsko zaglavlje/podnožje,
 *     numerisane sekcije, tipografija dokumenta. Ovo je primarni put iz ekrana „Generiši".
 *  2. `printMarkdownPdf(markdown, ...)` — fallback za arhivu gde imamo samo markdown snimak;
 *     precizan MD→HTML parser u istom akademskom stilu.
 *
 * Tehnika: čist HTML + `@page` pravila u izolovanom print prozoru → vektorski tekst
 * (biranje radi, oštri fontovi), bez ijedne npm zavisnosti.
 */

import type { AppSettings, Course, ResolvedVariant } from "../types/spec.types";

/* ─────────────────────────────────────────────────────────────────────────
   HTML escaping + inline markdown
   ───────────────────────────────────────────────────────────────────────── */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Inline markdown: `code`, **bold**, *italic* / _italic_. Redosled je bitan (code prvi). */
function inline(raw: string): string {
  let s = esc(raw);
  s = s.replace(/`([^`]+)`/g, (_, c: string) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, (_, b: string) => `<strong>${b}</strong>`);
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, (_, p: string, i: string) => `${p}<em>${i}</em>`);
  s = s.replace(/(^|\s)_([^_]+)_(?=\s|$|[.,])/g, (_, p: string, i: string) => `${p}<em>${i}</em>`);
  return s;
}

/* ─────────────────────────────────────────────────────────────────────────
   Akademski stil dokumenta
   ───────────────────────────────────────────────────────────────────────── */

const DOC_CSS = `
  @page {
    size: A4;
    margin: 24mm 22mm 22mm 22mm;
  }
  @page :first { margin: 0; }

  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: "Times New Roman", "Liberation Serif", Georgia, serif;
    color: #1a1a1a;
    font-size: 11pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Naslovna strana (FTN forma) ─────────────────────── */
  .cover {
    height: 297mm;
    padding: 25mm 25mm 22mm;
    display: flex;
    flex-direction: column;
    page-break-after: always;
    position: relative;
  }
  /* Zaglavlje: centrirano, Univerzitet / Fakultet / (grad), pa odsek levo */
  .cover-inst { text-align: center; }
  .cover-univ {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-size: 13pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.5;
  }
  .cover-fac {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-size: 13pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.5;
  }
  .cover-city {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.5;
  }
  .cover-dept {
    margin-top: 6mm;
    font-size: 11pt;
    text-align: left;
  }
  .cover-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  .cover-doctype {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-size: 16pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #1a1a1a;
    margin-bottom: 10mm;
  }
  .cover-title {
    font-size: 24pt;
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
    padding: 0 6mm;
  }
  .cover-abbr {
    font-size: 14pt;
    color: #444;
    margin-top: 4mm;
  }
  .cover-foot { margin-top: auto; }
  /* FTN metadata blok — labela: vrednost, levo poravnato */
  .cover-meta {
    border-top: 0.75pt solid #1a1a1a;
    padding-top: 6mm;
    font-size: 11pt;
  }
  .cover-meta table { width: 100%; border-collapse: collapse; }
  .cover-meta td { padding: 1.4mm 0; vertical-align: top; }
  .cover-meta td.k { width: 42mm; color: #333; }
  .cover-meta td.v { font-weight: 700; }
  .cover-sign {
    display: flex;
    justify-content: flex-end;
    margin-top: 16mm;
    font-size: 11pt;
  }
  .cover-sign .sign {
    text-align: center;
    min-width: 62mm;
  }
  .cover-sign .sign-line {
    border-top: 0.75pt solid #1a1a1a;
    margin-bottom: 2mm;
  }
  .cover-sign .sign-label { font-size: 10pt; color: #333; }

  /* ── Fiksni footer (ponavlja se na svakoj strani osim naslovne) ── */
  .page-footer {
    position: fixed;
    bottom: 8mm;
    left: 22mm;
    right: 22mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5pt;
    color: #777;
    border-top: 0.5px solid #ccc;
    padding-top: 1.5mm;
  }
  .page-footer .pf-faculty { font-variant: small-caps; letter-spacing: 0.02em; }
  .page-footer .pf-page::after { counter-increment: page; content: "Strana " counter(page); }

  /* ── Telo dokumenta (FTN: Times body justified, uvlačenje 1cm, Arial naslovi) ── */
  .body { counter-reset: sec; }
  h2.sec {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-size: 13pt;
    font-weight: 700;
    margin: 16px 0 7px;
    padding-bottom: 2px;
    border-bottom: 1pt solid #1a1a1a;
    page-break-after: avoid;
  }
  h3 {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-size: 11pt;
    font-weight: 700;
    margin: 11px 0 3px;
    page-break-after: avoid;
  }
  p { margin: 0 0 6px; orphans: 2; widows: 2; text-align: justify; text-indent: 10mm; }
  /* Pasusi koji ne treba da imaju uvlačenje (uvodni/lead, ispod naslova tabela) */
  p.lead, p.flush { text-indent: 0; }
  ul, ol { margin: 5px 0 10px; padding-left: 22px; }
  li { margin: 3px 0; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  code {
    font-family: "Courier New", monospace;
    font-size: 10pt;
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 2px;
  }
  /* Oznaka varijante u tekstu — elegantno spaced bold umesto IT badge-a */
  .vcode {
    font-weight: 700;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }
  /* Sažetak obima na vrhu tela */
  .summary {
    margin: 0 0 12px;
    padding: 4px 0 9px;
    border-bottom: 0.5pt solid #ccc;
    font-size: 10.5pt;
    color: #333;
    text-indent: 0;
  }
  .summary-label {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-weight: 700;
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #555;
    margin-right: 4px;
  }
  table.data {
    width: 100%;
    border-collapse: collapse;
    margin: 7px 0 15px;
    font-size: 10.5pt;
    page-break-inside: avoid;
  }
  table.data th, table.data td {
    border: 1px solid #999;
    padding: 5px 9px;
    text-align: left;
    vertical-align: top;
  }
  table.data th {
    background: #ececec;
    font-weight: 700;
    font-variant: small-caps;
    letter-spacing: 0.02em;
  }
  table.data td.num, table.data th.num { text-align: right; width: 24mm; }
  table.data tr.total td { font-weight: 700; background: #f6f6f6; }
  .lead { margin-bottom: 8px; }

  /* Funkcionalni zahtevi — numerisani moduli */
  .module { margin: 9px 0; page-break-inside: avoid; }
  .module-title { font-weight: 700; }
  .module-opt { font-style: italic; color: #777; font-weight: 400; }
  .module-desc { margin: 2px 0 0; }

  /* Domenski model — strukturisana lista */
  .entity { margin: 9px 0; page-break-inside: avoid; }
  .entity-name {
    font-family: Arial, "Helvetica Neue", sans-serif;
    font-weight: 700;
    font-size: 11pt;
  }
  .entity-attrs { margin: 2px 0 0; padding-left: 20px; list-style: square; }
  .entity-attrs li { margin: 1.5px 0; }
  .entity-attrs .attr-name { font-weight: 600; }
  .entity-attrs .attr-type { color: #555; }
  .entity-attrs .attr-type::before { content: "— "; color: #999; }
  .muted { color: #777; }

  /* Markdown fallback (arhiva) — zaglavlje umesto naslovne strane */
  .md-header {
    border-bottom: 1.5px solid #1a1a1a;
    padding-bottom: 4mm;
    margin-bottom: 8mm;
  }
  .md-header .md-faculty {
    font-size: 13pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .md-header .muted { font-size: 10pt; margin-top: 1mm; }
`;

/* ─────────────────────────────────────────────────────────────────────────
   Strukturisana generacija (primarni put — iz Course + variant)
   ───────────────────────────────────────────────────────────────────────── */

interface CoverMeta {
  k: string;
  v: string;
}

function coverPage(opts: {
  university: string;
  faculty: string;
  department: string;
  city: string;
  title: string;
  meta: CoverMeta[];
}): string {
  const { university, faculty, department, city, title, meta } = opts;
  return `<section class="cover">
    <div class="cover-inst">
      ${university ? `<div class="cover-univ">${esc(university)}</div>` : ""}
      ${faculty ? `<div class="cover-fac">${esc(faculty)}</div>` : ""}
      ${city ? `<div class="cover-city">${esc(city)}</div>` : ""}
    </div>
    ${department ? `<div class="cover-dept"><strong>Odsek / smer:</strong> ${esc(department)}</div>` : ""}
    <div class="cover-center">
      <div class="cover-doctype">Specifikacija projektnog zadatka</div>
      <h1 class="cover-title">${esc(title)}</h1>
    </div>
    <div class="cover-foot">
      <div class="cover-meta">
        <table><tbody>
          ${meta.map((m) => `<tr><td class="k">${esc(m.k)}</td><td class="v">${esc(m.v)}</td></tr>`).join("")}
        </tbody></table>
      </div>
      <div class="cover-sign">
        <div class="sign">
          <div class="sign-line"></div>
          <div class="sign-label">Predmetni nastavnik / asistent</div>
        </div>
      </div>
    </div>
  </section>`;
}

/** `numCols` — indeksi kolona koje su numeričke (desno poravnate, uža kolona). */
function dataTable(
  head: string[],
  rows: string[][],
  totalRow?: string[],
  numCols: number[] = [],
): string {
  const cls = (i: number) => (numCols.includes(i) ? ' class="num"' : "");
  const thead = `<thead><tr>${head.map((h, i) => `<th${cls(i)}>${esc(h)}</th>`).join("")}</tr></thead>`;
  const body = rows
    .map((r) => `<tr>${r.map((c, i) => `<td${cls(i)}>${inline(c)}</td>`).join("")}</tr>`)
    .join("");
  const total = totalRow
    ? `<tr class="total">${totalRow.map((c, i) => `<td${cls(i)}>${inline(c)}</td>`).join("")}</tr>`
    : "";
  return `<table class="data">${thead}<tbody>${body}${total}</tbody></table>`;
}

/** Srpska deklinacija uz broj: 1 → one, 2–4 → few, ostalo → many. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function buildBody(c: Course, s: AppSettings, v: ResolvedVariant): string {
  const out: string[] = [];
  let n = 0;
  /** Vraća redni broj sekcije i renderuje naslov; broj se koristi za podsekcije. */
  const sec = (title: string): number => {
    n += 1;
    out.push(`<h2 class="sec">${n}. ${esc(title)}</h2>`);
    return n;
  };

  // Sažetak zadatka — kratak pregled obima (mod / ent / poeni)
  const totalPts = c.grading.reduce((a, g) => a + (+g.poeni || 0), 0);
  const summary: string[] = [
    `${v.modules.length} ${plural(v.modules.length, "funkcionalni modul", "funkcionalna modula", "funkcionalnih modula")}`,
    `${v.entities.length} ${plural(v.entities.length, "entitet", "entiteta", "entiteta")}`,
  ];
  if (totalPts > 0) summary.push(`${totalPts} poena`);
  out.push(
    `<div class="summary"><span class="summary-label">Obim zadatka:</span> ${summary.join(" · ")}</div>`,
  );

  // 1. Opis projekta
  sec("Opis projekta");
  const desc =
    c.description?.trim() ||
    `Razvija se aplikacija na temu: <strong>${esc(v.scenario ? v.scenario.naziv : "zadatu temu")}</strong>.${
      v.scenario?.opis ? " " + esc(v.scenario.opis) : ""
    }`;
  out.push(`<p>${c.description?.trim() ? inline(c.description.trim()) : desc}</p>`);

  // 2. Tehnološki stack
  const ts: [string, string][] = (
    [
      ["Programski jezik", c.techStack.jezik],
      ["Backend", c.techStack.backend],
      ["Frontend", c.techStack.frontend],
      ["Baza podataka", c.techStack.baza],
      ["Ostalo", c.techStack.ostalo],
    ] as [string, string][]
  ).filter(([, x]) => x && x.trim() && x.trim() !== "—");
  if (ts.length) {
    sec("Tehnološki stack");
    out.push(dataTable(["Komponenta", "Tehnologija"], ts));
  }

  // 3. Metodologija rada
  sec("Metodologija rada");
  out.push(
    `<p>${
      c.usesAgileBoard
        ? `Primenjuje se <strong>Agile</strong> metodologija uz obaveznu Agile tablu (<strong>${esc(
            c.agileTool || "Agile board",
          )}</strong>): sprintovi, korisničke priče (user stories), raspodela i praćenje zadataka.`
        : `Primenjuje se fazni razvoj uz jasnu raspodelu odgovornosti i striktno poštovanje rokova.`
    }</p>`,
  );

  // 4. Domenski model — strukturisana lista (entitet kao podnaslov + atributi kao lista)
  sec("Domenski model");
  if (v.entities?.length) {
    out.push(
      v.entities
        .map(
          (e) =>
            `<div class="entity"><div class="entity-name">${esc(e.naziv)}</div>` +
            (e.atributi.length
              ? `<ul class="entity-attrs">${e.atributi
                  .map(
                    (a) =>
                      `<li><span class="attr-name">${esc(a.naziv)}</span> <span class="attr-type">${esc(
                        a.tip,
                      )}</span></li>`,
                  )
                  .join("")}</ul>`
              : "") +
            `</div>`,
        )
        .join(""),
    );
  } else {
    out.push(`<p class="muted"><em>Entiteti nisu definisani.</em></p>`);
  }

  // 5. Funkcionalni zahtevi — podsekcije nose broj tekuće sekcije
  const fnSec = sec("Funkcionalni zahtevi");
  out.push(
    `<p class="lead">Obavezna je potpuna <strong>CRUD</strong> funkcionalnost (Create, Read, Update, Delete) nad svim entitetima domena, uz validaciju ulaznih podataka. Pored toga, sistem mora implementirati sledeće funkcionalne celine:</p>`,
  );
  out.push(
    v.modules
      .map(
        (m, i) =>
          `<div class="module"><div class="module-title">${fnSec}.${i + 1} ${esc(m.naziv)}${
            m.mandatory ? "" : ` <span class="module-opt">(izborni)</span>`
          }</div>${m.opis ? `<p class="module-desc flush">${inline(m.opis)}</p>` : ""}</div>`,
      )
      .join(""),
  );

  // 6. Nefunkcionalni zahtevi
  if (c.nonFunctional?.length) {
    sec("Nefunkcionalni zahtevi");
    out.push(`<ul>${c.nonFunctional.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`);
  }

  // 7. Predaja i rokovi
  if (c.deliverables?.length) {
    sec("Predaja i rokovi");
    out.push(
      dataTable(
        ["Stavka", "Rok"],
        c.deliverables.map((d) => [d.naziv, d.rok]),
      ),
    );
  }

  // 8. Kriterijumi ocenjivanja
  if (c.grading?.length) {
    const sum = c.grading.reduce((a, g) => a + (+g.poeni || 0), 0);
    sec("Kriterijumi ocenjivanja");
    out.push(
      dataTable(
        ["Stavka", "Poeni"],
        c.grading.map((g) => [g.stavka, String(g.poeni)]),
        ["Ukupno", String(sum)],
        [1],
      ),
    );
  }

  // 9. Akademska čestitost
  if (s.integrityNote) {
    sec("Akademska čestitost");
    out.push(
      `<p>Svaka grupa i generacija dobija jedinstvenu varijantu (<span class="vcode">${esc(
        v.code,
      )}</span>) sa različitim domenom i skupom zahteva. Preuzimanje ranijih ili tuđih rešenja je uočljivo i tretira se kao prepisivanje.</p>`,
    );
  }

  // 10. Napomene
  if (c.notes?.trim()) {
    sec("Napomene");
    out.push(`<p class="flush">${inline(c.notes.trim()).replace(/\n/g, "<br/>")}</p>`);
  }

  return `<div class="body">${out.join("\n")}</div>`;
}

function renderAndPrint(title: string, inner: string, footer?: { left: string; right: string }): void {
  const footerHtml = footer
    ? `<div class="page-footer"><span class="pf-faculty">${esc(footer.left)}</span><span class="pf-page">${esc(footer.right)}</span></div>`
    : "";
  const html = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>${DOC_CSS}</style>
</head>
<body>
  ${footerHtml}
  ${inner}
  <script>
    window.addEventListener("load", function () { window.focus(); window.print(); });
    window.addEventListener("afterprint", function () { window.close(); });
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "specifikacija"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/** Današnji datum u dd.mm.gggg. formatu (srpski standard). */
function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`;
}

/** Primarni put: profesionalan akademski PDF iz strukturisanih podataka. */
export function printSpecPdf(c: Course, s: AppSettings, v: ResolvedVariant): void {
  const cityDate = [s.city, today()].filter(Boolean).join(", ");
  const meta: CoverMeta[] = [
    { k: "Predmet", v: c.abbr ? `${c.name} (${c.abbr})` : c.name },
    { k: "Školska godina", v: s.academicYear },
    { k: "Godina studija", v: `${c.yearOfStudy}. godina, ${c.semester}. semestar` },
    {
      k: "Tip projekta",
      v:
        c.projectType === "timski"
          ? `Timski (tim do ${c.teamSize} člana)`
          : "Individualni",
    },
  ];
  if (c.varyByTeam) meta.push({ k: "Grupa", v: String(v.teamIndex + 1) });
  meta.push({ k: "Oznaka varijante", v: v.code });
  meta.push({ k: "Mesto i datum", v: cityDate });

  const cover = coverPage({
    university: s.university,
    faculty: s.faculty,
    department: s.department,
    city: s.city,
    title: c.name,
    meta,
  });
  const body = buildBody(c, s, v);
  const footerLeft = [s.faculty, v.code].filter(Boolean).join(" · ");
  renderAndPrint(`${c.abbr || c.name} — ${v.code}`, cover + body, {
    left: footerLeft,
    right: "",
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   Markdown fallback (arhiva — imamo samo markdown snimak)
   ───────────────────────────────────────────────────────────────────────── */

function tableCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isTableSep(line: string): boolean {
  return /^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes("-");
}

function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (h) {
      closeList();
      const level = h[1].length;
      // # → naslovna h1 unutar tela, ## → numerisana sekcija stil
      const cls = level === 2 ? ' class="sec"' : "";
      const tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      out.push(`<${tag}${cls}>${inline(h[2])}</${tag}>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      closeList();
      const head = tableCells(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(tableCells(lines[i].trim()));
        i++;
      }
      const thead = `<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      out.push(`<table class="data">${thead}${tbody}</table>`);
      continue;
    }

    const li = /^[-*]\s+(.*)$/.exec(trimmed);
    if (li) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${inline(li[1])}</li>`);
      i++;
      continue;
    }

    closeList();
    const hardBreak = /\s{2,}$/.test(line);
    out.push(`<p>${inline(trimmed)}${hardBreak ? "<br/>" : ""}</p>`);
    i++;
  }

  closeList();
  return out.join("\n");
}

/** Fallback: PDF iz markdown snimka (arhiva), u istom akademskom stilu. */
export function printMarkdownPdf(opts: {
  markdown: string;
  title: string;
  faculty: string;
  academicYear: string;
}): void {
  const { markdown, title, faculty, academicYear } = opts;
  const header =
    faculty || academicYear
      ? `<div class="md-header">
          ${faculty ? `<div class="md-faculty">${esc(faculty)}</div>` : ""}
          ${academicYear ? `<div class="muted">Školska godina ${esc(academicYear)}</div>` : ""}
        </div>`
      : "";
  const footerLeft = faculty || title;
  renderAndPrint(title, `<div class="body">${header}${mdToHtml(markdown)}</div>`, {
    left: footerLeft,
    right: "",
  });
}
