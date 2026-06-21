import { courseShareRepo } from "@/infrastructure/repositories/courses.repo";
import { coursesRepo } from "@/infrastructure/repositories/courses.repo";
import { usersRepo } from "@/infrastructure/repositories/users.repo";

export class ShareError extends Error {}

export interface CourseAssistant {
  userId: string;
  name: string;
  email: string;
}

export const shareService = {
  async listAssistants(courseId: string): Promise<CourseAssistant[]> {
    return courseShareRepo.listAssistants(courseId);
  },

  /**
   * Owner deli kurs sa asistentom po email-u. Asistent mora već postojati
   * (ulogovao se bar jednom preko LMS-a). Ne može deliti sam sa sobom.
   */
  async shareByEmail(courseId: string, email: string): Promise<CourseAssistant> {
    const normalized = email.trim().toLowerCase();
    const user = await usersRepo.findByEmail(normalized);
    if (!user) {
      throw new ShareError(
        "Asistent sa tim email-om ne postoji. Mora se bar jednom prijaviti preko LMS-a.",
      );
    }
    if (user.role !== "admin") {
      throw new ShareError("Kurs se može podeliti samo sa asistentom.");
    }
    const ownerId = await coursesRepo.findOwnerId(courseId);
    if (ownerId === user.id) {
      throw new ShareError("Već ste vlasnik ovog kursa.");
    }
    await courseShareRepo.add(courseId, user.id);
    return {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
    };
  },

  async unshare(courseId: string, userId: string): Promise<void> {
    await courseShareRepo.remove(courseId, userId);
  },
};
