"use server";

import { requireAdmin } from "@/lib/guards";
import { coursesService } from "@/application/courses.service";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Course, CourseInput } from "@/features/specsgen/types/spec.types";

export async function getCoursesAction(): Promise<ActionResult<Course[]>> {
  try {
    await requireAdmin();
    const courses = await coursesService.getAll();
    return ok(courses);
  } catch {
    return fail("Greška pri učitavanju predmeta");
  }
}

export async function createCourseAction(data: CourseInput): Promise<ActionResult<Course>> {
  try {
    await requireAdmin();
    const course = await coursesService.create(data);
    return ok(course);
  } catch {
    return fail("Greška pri kreiranju predmeta");
  }
}

export async function updateCourseAction(id: string, data: CourseInput): Promise<ActionResult<Course>> {
  try {
    await requireAdmin();
    const course = await coursesService.update(id, data);
    return ok(course);
  } catch {
    return fail("Greška pri ažuriranju predmeta");
  }
}

export async function deleteCourseAction(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    await coursesService.delete(id);
    return ok(undefined);
  } catch {
    return fail("Greška pri brisanju predmeta");
  }
}

/** Ubacuje polazne template predmete (ODP, OIB, ERS) i vraća kompletnu listu. */
export async function loadTemplateCoursesAction(): Promise<ActionResult<Course[]>> {
  try {
    await requireAdmin();
    const courses = await coursesService.loadTemplates();
    return ok(courses);
  } catch {
    return fail("Greška pri učitavanju template predmeta");
  }
}
