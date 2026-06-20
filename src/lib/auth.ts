import NextAuth from "next-auth";
import type { OAuthConfig } from "next-auth/providers";
import { tapizLmsProvider } from "@tapizlabs/identity/sso";
import type { LmsProfile } from "@tapizlabs/identity";
import { authConfig } from "./auth.config";
import { fullName } from "@/domain/types";
import { mapLmsRole, ssoService } from "@/application/sso.service";

// Isključivo LMS SSO — credentials prijava nije podržana.
// Samo `assistant` LMS uloga dobija pristup (mapira na "admin").
const lmsProvider = {
  ...tapizLmsProvider(process.env),
  profile(p: LmsProfile) {
    return {
      id: p.sub,
      email: p.email,
      name: `${p.given_name} ${p.family_name}`,
      role: mapLmsRole(p.role) ?? "user",
    };
  },
} as OAuthConfig<LmsProfile>;

export const lmsSsoEnabled = true;

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth({
  ...authConfig,
  providers: [lmsProvider],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider !== "tapiz-lms") return "/login?error=sso-only";
      if (!profile?.sub || !profile.email) return "/login?error=lms-sso";
      // Odbiti studente — samo asistenti imaju pristup
      if (mapLmsRole(String(profile.role)) !== "admin") return "/login?error=lms-role";

      const result = await ssoService.linkOrCreateFromLms(profile as unknown as LmsProfile);
      if (!result.ok) return "/login?error=lms-conflict";

      user.id = result.user.id;
      user.role = result.user.role;
      user.name = fullName(result.user);
      user.email = result.user.email;
      return true;
    },
  },
});
