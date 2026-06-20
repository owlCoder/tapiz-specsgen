import { coursesRepo } from "@/infrastructure/repositories/courses.repo";
import { SEED_COURSES } from "@/features/specgen/lib/seed";
import type { Course, CourseInput } from "@/features/specgen/types/spec.types";

export const coursesService = {
  async getAll(): Promise<Course[]> {
    return coursesRepo.findAll();
  },

  async seedIfEmpty(): Promise<void> {
    const n = await coursesRepo.count();
    if (n === 0) {
      await coursesRepo.insertMany(SEED_COURSES);
    }
  },

  async create(data: CourseInput): Promise<Course> {
    return coursesRepo.create(data);
  },

  async update(id: string, data: CourseInput): Promise<Course> {
    const updated = await coursesRepo.update(id, data);
    if (!updated) throw new Error("Predmet nije pronađen");
    return updated;
  },

  async delete(id: string): Promise<void> {
    return coursesRepo.delete(id);
  },
};
