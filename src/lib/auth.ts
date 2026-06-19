import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { OAuthConfig } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { isLmsSsoEnabled, tapizLmsProvider } from "@tapizlabs/identity/sso";
import type { LmsProfile } from "@tapizlabs/identity";
import { authConfig } from "./auth.config";
import { loginSchema } from "@/domain/validation/user.schema";
import { usersRepo } from "@/infrastructure/repositories/users.repo";
import { fullName } from "@/domain/types";
import { mapLmsRole, ssoService } from "@/application/sso.service";

// SSO preko Tapiz LMS-a (OAuth 2.0 code flow + PKCE).
// App posle prijave izdaje SOPSTVENU JWT sesiju; LMS token se ne čuva.
// Provider se registruje samo kad su sve LMS_* env varijable postavljene.
export const lmsSsoEnabled = isLmsSsoEnabled(process.env);

// Wiring providera (URL-ovi, PKCE, client) je standardizovan u @tapizlabs/identity/sso.
// `profile()` override-ujemo jer template mapira LMS rolu u svoje role (admin|user).
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

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await usersRepo.findByEmail(parsed.data.email);
        if (!user) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: fullName(user),
          role: user.role,
        };
      },
    }),
    ...(lmsSsoEnabled ? [lmsProvider] : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider !== "tapiz-lms") return true;
      if (!profile?.sub || !profile.email) return "/login?error=lms-sso";
      if (mapLmsRole(String(profile.role)) === null) return "/login?error=lms-role";

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
