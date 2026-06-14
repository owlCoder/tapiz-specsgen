"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/domain/validation/user.schema";
import { usersService } from "@/application/users.service";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { runAction } from "./helpers";

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return ok(undefined);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof AuthError) return fail("Pogrešan email ili lozinka");
    throw err;
  }
}

export async function registerAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  return runAction(async () => {
    await usersService.register(parsed.data);
    return ok(undefined);
  });
}

export async function lmsLoginAction(): Promise<void> {
  await signIn("tapiz-lms", { redirectTo: "/" });
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
