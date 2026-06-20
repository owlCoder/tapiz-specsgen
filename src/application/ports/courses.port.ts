import type { Course, CourseInput } from "@/features/specsgen/types/spec.types";

export interface ICoursesRepo {
  findAll(): Promise<Course[]>;
  count(): Promise<number>;
  create(data: CourseInput): Promise<Course>;
  update(id: string, data: Partial<CourseInput>): Promise<Course | null>;
  delete(id: string): Promise<void>;
  insertMany(data: CourseInput[]): Promise<void>;
}
