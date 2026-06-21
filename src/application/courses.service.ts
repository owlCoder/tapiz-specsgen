import { coursesRepo } from "@/infrastructure/repositories/courses.repo";
import { SEED_COURSES } from "@/features/specsgen/lib/seed";
import type { Course, CourseInput } from "@/features/specsgen/types/spec.types";

export const coursesService = {
  /** Kursevi vidljivi useru: njegovi (owner) + podeljeni sa njim (shared). */
  async getAllForUser(userId: string): Promise<Course[]> {
    return coursesRepo.findAllForUser(userId);
  },

  async create(data: CourseInput, ownerId: string): Promise<Course> {
    return coursesRepo.create(data, ownerId);
  },

  /** "Iskoristi template": kopira javni read-only template kao privatan kurs usera. */
  async createFromTemplate(abbr: string, ownerId: string): Promise<Course> {
    const tpl = SEED_COURSES.find((c) => c.abbr === abbr);
    if (!tpl) throw new Error("Template nije pronađen");
    return coursesRepo.create(tpl, ownerId);
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
