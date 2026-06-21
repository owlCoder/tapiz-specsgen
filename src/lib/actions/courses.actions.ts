"use server";

import { requireAdmin, requireCourseAccess, requireCourseOwner } from "@/lib/guards";
import { coursesService } from "@/application/courses.service";
import { shareService, ShareError, type CourseAssistant } from "@/application/share.service";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Course, CourseInput } from "@/features/specsgen/types/spec.types";

export async function getCoursesAction(): Promise<ActionResult<Course[]>> {
  try {
    const user = await requireAdmin();
    const courses = await coursesService.getAllForUser(user.id);
    return ok(courses);
  } catch {
    return fail("Greška pri učitavanju predmeta");
  }
}

export async function createCourseAction(data: CourseInput): Promise<ActionResult<Course>> {
  try {
    const user = await requireAdmin();
    const course = await coursesService.create(data, user.id);
    return ok(course);
  } catch {
    return fail("Greška pri kreiranju predmeta");
  }
}

/** "Iskoristi template": kopira javni template (ODP/OIB/ERS) kao moj privatan kurs. */
export async function copyTemplateAction(abbr: string): Promise<ActionResult<Course>> {
  try {
    const user = await requireAdmin();
    const course = await coursesService.createFromTemplate(abbr, user.id);
    return ok(course);
  } catch {
    return fail("Greška pri kopiranju template-a");
  }
}

export async function updateCourseAction(id: string, data: CourseInput): Promise<ActionResult<Course>> {
  try {
    await requireCourseAccess(id);
    const course = await coursesService.update(id, data);
    return ok(course);
  } catch {
    return fail("Greška pri ažuriranju predmeta");
  }
}

export async function deleteCourseAction(id: string): Promise<ActionResult<void>> {
  try {
    await requireCourseOwner(id);
    await coursesService.delete(id);
    return ok(undefined);
  } catch {
    return fail("Greška pri brisanju predmeta");
  }
}

// ─── Deljenje sa ko-asistentima ──────────────────────────────────────────────

export async function getCourseAssistantsAction(
  courseId: string,
): Promise<ActionResult<CourseAssistant[]>> {
  try {
    await requireCourseAccess(courseId);
    const list = await shareService.listAssistants(courseId);
    return ok(list);
  } catch {
    return fail("Greška pri učitavanju ko-asistenata");
  }
}

export async function shareCourseAction(
  courseId: string,
  email: string,
): Promise<ActionResult<CourseAssistant>> {
  try {
    await requireCourseOwner(courseId);
    const assistant = await shareService.shareByEmail(courseId, email);
    return ok(assistant);
  } catch (e) {
    if (e instanceof ShareError) return fail(e.message);
    return fail("Greška pri deljenju predmeta");
  }
}

export async function unshareCourseAction(
  courseId: string,
  userId: string,
): Promise<ActionResult<void>> {
  try {
    await requireCourseOwner(courseId);
    await shareService.unshare(courseId, userId);
    return ok(undefined);
  } catch {
    return fail("Greška pri uklanjanju ko-asistenta");
  }
}
