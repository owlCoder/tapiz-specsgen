import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import type { LmsProfile } from "@tapizlabs/identity";
import type { Role, UserDto } from "@/domain/types";
import { usersRepo } from "@/infrastructure/repositories/users.repo";

// `LmsProfile` (claims iz LMS /oauth/userinfo) je standardizovan u @tapizlabs/identity
// — zajednički za LMS i sve spoke proizvode. Re-export da auth.ts ima jedan izvor tipa.
export type { LmsProfile };

export type LmsLinkResult = { ok: true; user: UserDto } | { ok: false; error: "email-conflict" };

/**
 * LMS role → app role. Template mapira student→user, assistant→admin; override-uje
 * identity.mapLmsRole (koji vraća student|assistant) jer template ima role admin|user.
 * Vrati null za role koje ne smeju imati pristup.
 */
export function mapLmsRole(role: string): Role | null {
  if (role === "student") return "user";
  if (role === "assistant") return "admin";
  return null;
}

function affiliationFields(p: LmsProfile) {
  return {
    universityId: Number.isInteger(p.university_id) ? (p.university_id as number) : null,
    facultyId: Number.isInteger(p.faculty_id) ? (p.faculty_id as number) : null,
    universityName: p.university_short_name?.slice(0, 100) ?? null,
    facultyName: p.faculty_short_name?.slice(0, 100) ?? null,
  };
}

export const ssoService = {
  /**
   * Nađi/poveži/kreiraj lokalnog usera za LMS profil:
   * 1. lookup po lmsSubjectId (sub je primaran identitet posle prvog povezivanja),
   * 2. pa po emailu — postojeći lokalni nalog se povezuje,
   *    osim ako je već vezan za DRUGI LMS nalog (kolizija → odbij),
   * 3. inače kreiraj novi nalog sa nasumičnom lozinkom (credentials prijava ne radi).
   * Pripadnost i rola se osvežavaju pri SVAKOJ SSO prijavi.
   */
  async linkOrCreateFromLms(profile: LmsProfile): Promise<LmsLinkResult> {
    const role = mapLmsRole(profile.role) ?? "user";
    const affiliation = affiliationFields(profile);

    const bySub = await usersRepo.findByLmsSubjectId(profile.sub);
    if (bySub) {
      await usersRepo.update(bySub.id, { role, ...affiliation });
      return { ok: true, user: { ...bySub, role, ...affiliation } };
    }

    const byEmail = await usersRepo.findByEmail(profile.email);
    if (byEmail) {
      const existingSub = await usersRepo.getLmsSubjectId(byEmail.id);
      if (existingSub && existingSub !== profile.sub) return { ok: false, error: "email-conflict" };
      await usersRepo.update(byEmail.id, {
        lmsSubjectId: profile.sub,
        authProvider: "tapiz-lms",
        role,
        ...affiliation,
      });
      const { passwordHash, ...user } = byEmail;
      void passwordHash;
      return { ok: true, user: { ...user, role, ...affiliation } };
    }

    const user = await usersRepo.create({
      firstName: profile.given_name,
      lastName: profile.family_name,
      email: profile.email,
      passwordHash: await bcrypt.hash(randomBytes(32).toString("base64url"), 10),
      role,
      lmsSubjectId: profile.sub,
      authProvider: "tapiz-lms",
      ...affiliation,
    });
    return { ok: true, user };
  },
};
