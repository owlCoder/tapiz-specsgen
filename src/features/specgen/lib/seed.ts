import type { AppSettings, Course, Entitet, Module, Scenario } from "../types/spec.types";
import { uid } from "./uid";

export const SEED_SETTINGS: AppSettings = {
  faculty: "Fakultet tehničkih nauka, Novi Sad",
  academicYear: "2025/2026",
  integrityNote: true,
};

const ent = (naziv: string, atributi: [string, string, boolean?][], optional = false): Entitet => ({
  naziv,
  optional,
  atributi: atributi.map((a) => ({ naziv: a[0], tip: a[1], optional: !!a[2] })),
});

const mod = (naziv: string, opis: string, kategorija: string, mandatory: boolean): Module => ({
  id: uid(),
  naziv,
  opis,
  kategorija,
  mandatory,
});

const scn = (naziv: string, opis: string, entiteti: Entitet[]): Scenario => ({
  id: uid(),
  naziv,
  opis,
  entiteti,
});

export const SEED_COURSES: Omit<Course, "id">[] = [
  {
    name: "Osnove distribuiranog programiranja",
    abbr: "ODP",
    yearOfStudy: 3,
    semester: 6,
    projectType: "timski",
    teamSize: 3,
    description: "",
    techStack: { jezik: "C#", backend: ".NET / gRPC", frontend: "—", baza: "MS SQL Server / Azure SQL", ostalo: "Azure cloud, Docker" },
    usesAgileBoard: false,
    agileTool: "",
    optionalCount: 4,
    varyByTeam: true,
    numTeams: 8,
    entityVarMin: 0,
    entityVarMax: 2,
    modules: [
      mod("Distribuirana arhitektura", "Sistem mora biti podeljen na najmanje dva nezavisna servisa koji komuniciraju preko mreže.", "Distribucija", true),
      mod("Međuservisna komunikacija", "Komunikacija između servisa preko gRPC ili REST sa jasno definisanim ugovorom.", "Distribucija", true),
      mod("Perzistencija podataka", "Trajno čuvanje podataka u relacionoj bazi.", "Osnovno", true),
      mod("Postavljanje na Azure", "Aplikaciju postaviti na Azure (App Service / Container Apps) sa javnim URL-om.", "Cloud", false),
      mod("Kontejnerizacija (Docker)", "Svaki servis spakovati u Docker kontejner.", "Cloud", false),
      mod("Asinhrona razmena poruka", "Uvesti red poruka (Azure Service Bus / RabbitMQ).", "Distribucija", false),
      mod("Keširanje", "Keš sloj (Redis / Azure Cache) radi rasterećenja baze.", "Performanse", false),
      mod("Otpornost na greške", "Retry i circuit breaker za međuservisne pozive.", "Pouzdanost", false),
      mod("Centralizovano logovanje", "Prikupljanje logova i metrika (Application Insights).", "Operacije", false),
      mod("API Gateway", "Jedinstvena ulazna tačka koja rutira zahteve.", "Distribucija", false),
      mod("Autentikacija servisa", "Zaštita međuservisne komunikacije (API ključ / token).", "Bezbednost", false),
      mod("Horizontalno skaliranje", "Više instanci servisa iza balansera.", "Performanse", false),
    ],
    scenarios: [
      scn("Sistem za rezervaciju karata", "Distribuirani sistem za prodaju i rezervaciju karata za događaje.", [
        ent("Dogadjaj", [["id", "int"], ["naziv", "string"], ["datum", "DateTime"], ["kapacitet", "int", true]]),
        ent("Rezervacija", [["id", "int"], ["dogadjajId", "int"], ["korisnik", "string"], ["brojMesta", "int"]]),
        ent("Placanje", [["id", "int"], ["rezervacijaId", "int"], ["iznos", "decimal"]], true),
      ]),
      scn("Praćenje isporuka", "Praćenje pošiljki kroz više distribuiranih čvorova.", [
        ent("Posiljka", [["id", "int"], ["posiljalac", "string"], ["primalac", "string"], ["status", "enum"]]),
        ent("Cvor", [["id", "int"], ["lokacija", "string"], ["tip", "string"]]),
        ent("Dogadjaj", [["id", "int"], ["posiljkaId", "int"], ["vreme", "DateTime"]], true),
      ]),
      scn("Obrada narudžbina", "Backend e-prodavnice sa distribuiranom obradom.", [
        ent("Narudzbina", [["id", "int"], ["kupac", "string"], ["iznos", "decimal"], ["status", "enum"]]),
        ent("Stavka", [["id", "int"], ["narudzbinaId", "int"], ["proizvod", "string"], ["kolicina", "int"]]),
        ent("Isporuka", [["id", "int"], ["narudzbinaId", "int"], ["adresa", "string"]], true),
      ]),
      scn("IoT senzorska mreža", "Prikupljanje i obrada podataka sa distribuiranih senzora.", [
        ent("Senzor", [["id", "int"], ["lokacija", "string"], ["tip", "string"]]),
        ent("Merenje", [["id", "int"], ["senzorId", "int"], ["vrednost", "double"], ["vreme", "DateTime"]]),
        ent("Alarm", [["id", "int"], ["senzorId", "int"], ["prag", "double"]], true),
      ]),
      scn("Upravljanje skladištem", "Distribuirano upravljanje zalihama u više skladišta.", [
        ent("Artikal", [["id", "int"], ["naziv", "string"], ["kolicina", "int"]]),
        ent("Skladiste", [["id", "int"], ["lokacija", "string"], ["kapacitet", "int", true]]),
        ent("Transfer", [["id", "int"], ["odId", "int"], ["doId", "int"]], true),
      ]),
      scn("Online aukcije", "Aukcije sa konkurentnim licitiranjem u realnom vremenu.", [
        ent("Aukcija", [["id", "int"], ["naziv", "string"], ["pocetnaCena", "decimal"], ["krajnje", "DateTime"]]),
        ent("Ponuda", [["id", "int"], ["aukcijaId", "int"], ["korisnik", "string"], ["iznos", "decimal"]]),
        ent("Korisnik", [["id", "int"], ["ime", "string"]], true),
      ]),
    ],
    nonFunctional: [
      "Sistem mora ispravno raditi pri konkurentnom pristupu više klijenata.",
      "Vreme odziva osnovnih operacija mora biti razumno pod normalnim opterećenjem.",
    ],
    deliverables: [
      { naziv: "Predaja arhitekture i podele uloga", rok: "4. nedelja" },
      { naziv: "Demonstracija distribuirane komunikacije", rok: "9. nedelja" },
      { naziv: "Finalna odbrana", rok: "kolokvijumska nedelja" },
    ],
    grading: [
      { stavka: "Funkcionalnost (CRUD + moduli)", poeni: 35 },
      { stavka: "Distribuirana arhitektura i cloud", poeni: 35 },
      { stavka: "Odbrana", poeni: 30 },
    ],
    notes: "",
  },
  {
    name: "Osnove informacione bezbednosti",
    abbr: "OIB",
    yearOfStudy: 3,
    semester: 6,
    projectType: "timski",
    teamSize: 2,
    description: "",
    techStack: { jezik: "Java", backend: "Spring Boot / Spring Security", frontend: "Angular", baza: "PostgreSQL", ostalo: "JWT, TLS, BCrypt" },
    usesAgileBoard: false,
    agileTool: "",
    optionalCount: 4,
    varyByTeam: true,
    numTeams: 8,
    entityVarMin: 0,
    entityVarMax: 2,
    modules: [
      mod("Autentikacija korisnika", "Siguran login/logout sa upravljanjem sesijom.", "Bezbednost", true),
      mod("Autorizacija (RBAC)", "Kontrola pristupa zasnovana na ulogama.", "Bezbednost", true),
      mod("Bezbedno čuvanje lozinki", "Lozinke kao hash sa salt-om (BCrypt), nikada plain.", "Bezbednost", true),
      mod("Dvofaktorska autentikacija (2FA)", "Drugi faktor pri prijavi (TOTP / email kod).", "Bezbednost", false),
      mod("JWT tokeni", "Potpisani JWT tokeni sa rokom važenja.", "Bezbednost", false),
      mod("Enkripcija osetljivih podataka", "Šifrovanje osetljivih polja u bazi (AES).", "Bezbednost", false),
      mod("HTTPS / TLS", "Sva komunikacija preko šifrovanog kanala.", "Bezbednost", false),
      mod("Audit log", "Evidencija bezbednosno relevantnih događaja.", "Nadzor", false),
      mod("Zaštita od SQL injection i XSS", "Parametarizovani upiti i sanitizacija ulaza/izlaza.", "Bezbednost", false),
      mod("Politika lozinki i zaključavanje", "Pravila složenosti i zaključavanje naloga.", "Bezbednost", false),
      mod("Rate limiting", "Ograničenje broja zahteva (anti brute-force).", "Bezbednost", false),
      mod("Refresh token i sesije", "Osvežavanje tokena i bezbedno isticanje sesije.", "Bezbednost", false),
    ],
    scenarios: [
      scn("Elektronski zdravstveni karton", "Kontrolisan pristup medicinskim podacima.", [
        ent("Pacijent", [["id", "long"], ["ime", "string"], ["jmbg(enc)", "string"]]),
        ent("Korisnik", [["id", "long"], ["username", "string"], ["uloga", "enum"]]),
        ent("Nalaz", [["id", "long"], ["pacijentId", "long"], ["sadrzaj(enc)", "string"]], true),
      ]),
      scn("Internet bankarstvo", "Visoki bezbednosni zahtevi za transakcije.", [
        ent("Klijent", [["id", "long"], ["ime", "string"], ["status", "enum"]]),
        ent("Racun", [["id", "long"], ["klijentId", "long"], ["stanje", "decimal"]]),
        ent("Transakcija", [["id", "long"], ["sa", "string"], ["na", "string"], ["iznos", "decimal"]], true),
      ]),
      scn("Poverljivi dokumenti", "Čuvanje i deljenje dokumenata sa nivoima poverljivosti.", [
        ent("Dokument", [["id", "long"], ["naziv", "string"], ["nivo", "enum"], ["sadrzaj(enc)", "string"]]),
        ent("Korisnik", [["id", "long"], ["username", "string"], ["uloga", "enum"]]),
        ent("Pristup", [["id", "long"], ["dokumentId", "long"], ["korisnikId", "long"]], true),
      ]),
      scn("Portal e-uprave", "Autentikacija građana i kontrolisan pristup uslugama.", [
        ent("Gradjanin", [["id", "long"], ["ime", "string"], ["jmbg(enc)", "string"]]),
        ent("Zahtev", [["id", "long"], ["gradjaninId", "long"], ["tip", "string"], ["status", "enum"]]),
        ent("Sluzbenik", [["id", "long"], ["username", "string"], ["uloga", "enum"]], true),
      ]),
      scn("Online glasanje", "Integritet, anonimnost i autorizacija.", [
        ent("Glasanje", [["id", "long"], ["naziv", "string"], ["aktivno", "bool"]]),
        ent("Glasac", [["id", "long"], ["identifikator", "string"], ["uloga", "enum"]]),
        ent("Glas", [["id", "long"], ["glasanjeId", "long"], ["opcija", "string"]], true),
      ]),
    ],
    nonFunctional: [
      "Sistem mora štititi poverljivost, integritet i dostupnost podataka.",
      "Nijedan endpoint ne sme biti dostupan bez odgovarajuće autorizacije.",
    ],
    deliverables: [
      { naziv: "Model pretnji i bezbednosni zahtevi", rok: "6. nedelja" },
      { naziv: "Finalna odbrana", rok: "kolokvijumska nedelja" },
    ],
    grading: [
      { stavka: "Bezbednosni mehanizmi", poeni: 50 },
      { stavka: "Funkcionalnost (CRUD)", poeni: 20 },
      { stavka: "Odbrana", poeni: 30 },
    ],
    notes: "",
  },
  {
    name: "Elementi razvoja softvera",
    abbr: "ERS",
    yearOfStudy: 4,
    semester: 7,
    projectType: "timski",
    teamSize: 4,
    description: "",
    techStack: { jezik: "TypeScript / Java", backend: "Spring Boot", frontend: "React / Angular", baza: "PostgreSQL", ostalo: "Docker, CI/CD" },
    usesAgileBoard: true,
    agileTool: "Jira",
    optionalCount: 4,
    varyByTeam: true,
    numTeams: 10,
    entityVarMin: 0,
    entityVarMax: 2,
    modules: [
      mod("REST API", "Funkcionalnosti preko REST API-ja sa jasnim resursima.", "Osnovno", true),
      mod("Korisnički interfejs", "Frontend aplikacija koja koristi REST API.", "Osnovno", true),
      mod("Perzistencija u bazi", "Trajno čuvanje podataka uz model i migracije.", "Osnovno", true),
      mod("Autentikacija i autorizacija", "Prijava i kontrola pristupa po ulogama.", "Bezbednost", false),
      mod("Paginacija i filtriranje", "Straničenje, sortiranje i filteri nad listama.", "Funkcionalnost", false),
      mod("Pretraga", "Pretraga po ključnim poljima.", "Funkcionalnost", false),
      mod("Upload fajlova", "Otpremanje i čuvanje fajlova.", "Funkcionalnost", false),
      mod("Generisanje izveštaja", "Eksport u PDF / Excel.", "Funkcionalnost", false),
      mod("Notifikacije", "Obaveštenja (email / u aplikaciji).", "Funkcionalnost", false),
      mod("CI/CD pipeline", "Automatizovani build i deploy.", "DevOps", false),
      mod("Kontejnerizacija (Docker)", "Pakovanje u Docker kontejnere.", "DevOps", false),
      mod("Automatizovani testovi", "Unit i integration testovi.", "Kvalitet", false),
      mod("Dashboard sa statistikom", "Agregirani podaci i metrike.", "Funkcionalnost", false),
    ],
    scenarios: [
      scn("Upravljanje prodavnicom", "Proizvodi, zalihe i narudžbine.", [
        ent("Proizvod", [["id", "long"], ["naziv", "string"], ["cena", "decimal"]]),
        ent("Narudzbina", [["id", "long"], ["kupac", "string"], ["status", "enum"]]),
        ent("Kategorija", [["id", "long"], ["naziv", "string"]], true),
      ]),
      scn("Rezervacije usluga", "Zakazivanje termina i usluga.", [
        ent("Usluga", [["id", "long"], ["naziv", "string"], ["trajanje", "int"]]),
        ent("Termin", [["id", "long"], ["uslugaId", "long"], ["vreme", "DateTime"]]),
        ent("Klijent", [["id", "long"], ["ime", "string"]], true),
      ]),
      scn("Upravljanje projektima", "Zadaci, timovi i napredak.", [
        ent("Projekat", [["id", "long"], ["naziv", "string"], ["rok", "DateTime"]]),
        ent("Zadatak", [["id", "long"], ["projekatId", "long"], ["status", "enum"]]),
        ent("Clan", [["id", "long"], ["ime", "string"], ["uloga", "string"]], true),
      ]),
      scn("Upravljanje teretanom", "Članovi, treninzi i članarine.", [
        ent("Clan", [["id", "long"], ["ime", "string"], ["clanarina", "enum"]]),
        ent("Trening", [["id", "long"], ["naziv", "string"], ["termin", "DateTime"]]),
        ent("Trener", [["id", "long"], ["ime", "string"]], true),
      ]),
      scn("Upravljanje događajima", "Organizacija događaja i prijave.", [
        ent("Dogadjaj", [["id", "long"], ["naziv", "string"], ["datum", "DateTime"]]),
        ent("Prijava", [["id", "long"], ["dogadjajId", "long"], ["ucesnik", "string"]]),
        ent("Lokacija", [["id", "long"], ["naziv", "string"], ["kapacitet", "int"]], true),
      ]),
    ],
    nonFunctional: [
      "Kod organizovan u slojeve sa jasnom odgovornošću.",
      "Aplikacija pokrivena osnovnim testovima.",
    ],
    deliverables: [
      { naziv: "Sprint 1 – predaja", rok: "5. nedelja" },
      { naziv: "Sprint 2 – predaja", rok: "10. nedelja" },
      { naziv: "Finalna odbrana", rok: "kolokvijumska nedelja" },
    ],
    grading: [
      { stavka: "Funkcionalnost (CRUD + moduli)", poeni: 40 },
      { stavka: "Proces (Agile, testovi, CI)", poeni: 30 },
      { stavka: "Odbrana", poeni: 30 },
    ],
    notes: "",
  },
];
