import type { Course, CourseInput } from "@/features/specsgen/types/spec.types";

export interface ICoursesRepo {
  /** Kursevi koje user poseduje ILI mu je neko podelio (sa access/ownerName meta). */
  findAllForUser(userId: string): Promise<Course[]>;
  /** Sirovi kurs po id-u (bez access meta) — za guard provere i čitanje. */
  findById(id: string): Promise<Course | null>;
  /** ownerId vlasnika kursa, ili null ako ne postoji. */
  findOwnerId(id: string): Promise<string | null>;
  count(): Promise<number>;
  create(data: CourseInput, ownerId: string): Promise<Course>;
  update(id: string, data: Partial<CourseInput>): Promise<Course | null>;
  delete(id: string): Promise<void>;
}

export interface ICourseShareRepo {
  /** Asistenti (ko-vlasnici) kojima je kurs podeljen. */
  listAssistants(courseId: string): Promise<{ userId: string; name: string; email: string }[]>;
  add(courseId: string, userId: string): Promise<void>;
  remove(courseId: string, userId: string): Promise<void>;
  isSharedWith(courseId: string, userId: string): Promise<boolean>;
}
