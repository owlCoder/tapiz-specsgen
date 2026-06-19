"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isLocale, type Locale } from "./config";

/**
 * Postavlja locale cookie SERVER-SIDE i revalidira ceo layout.
 * Pouzdanije od `document.cookie` + `router.refresh()` (koji u Next 16 ne pokupi
 * sveže postavljen klijentski cookie deterministički pri RSC refetch-u).
 */
export async function setLocaleAction(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
