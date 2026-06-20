"use server";

import { signIn, signOut } from "@/lib/auth";

export async function lmsLoginAction(): Promise<void> {
  await signIn("tapiz-lms", { redirectTo: "/" });
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
