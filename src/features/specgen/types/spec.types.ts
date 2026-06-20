export interface Atribut {
  naziv: string;
  tip: string;
  optional: boolean;
}

export interface Entitet {
  naziv: string;
  optional: boolean;
  atributi: Atribut[];
}

export interface Scenario {
  id: string;
  naziv: string;
  opis: string;
  entiteti: Entitet[];
}

export interface Module {
  id: string;
  naziv: string;
  opis: string;
  kategorija: string;
  mandatory: boolean;
}

export interface Deliverable {
  naziv: string;
  rok: string;
}

export interface GradingItem {
  stavka: string;
  poeni: number;
}

export interface TechStack {
  jezik: string;
  backend: string;
  frontend: string;
  baza: string;
  ostalo: string;
}

export interface Course {
  id: string;
  name: string;
  abbr: string;
  yearOfStudy: number;
  semester: number;
  projectType: "timski" | "individualni";
  teamSize: number;
  description: string;
  techStack: TechStack;
  usesAgileBoard: boolean;
  agileTool: string;
  optionalCount: number;
  varyByTeam: boolean;
  numTeams: number;
  entityVarMin: number;
  entityVarMax: number;
  modules: Module[];
  scenarios: Scenario[];
  nonFunctional: string[];
  deliverables: Deliverable[];
  grading: GradingItem[];
  notes: string;
}

export interface AppSettings {
  faculty: string;
  academicYear: string;
  integrityNote: boolean;
}

export interface ResolvedEntitet {
  naziv: string;
  atributi: Atribut[];
}

export interface ResolvedVariant {
  scenario: Scenario | null;
  entities: ResolvedEntitet[];
  modules: Module[];
  teamIndex: number;
  code: string;
}

export interface ArchiveVariant {
  teamIndex: number;
  code: string;
  scenario: string;
  markdown: string;
}

export interface ArchiveEntry {
  id: string;
  courseId: string | null;
  courseName: string;
  abbr: string;
  academicYear: string;
  faculty: string;
  createdAt: string;
  variants: ArchiveVariant[];
}

export type CourseInput = Omit<Course, "id">;
