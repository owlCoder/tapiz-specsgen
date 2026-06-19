// `ActionResult` i helperi su standardizovani u @tapizlabs/app-kit (deljeno
// između svih Tapiz proizvoda). Ovaj modul ostaje kao tanak re-export da postojeći
// `@/lib/action-result` importi rade i da imamo jedno mesto ako zatreba lokalna nadgradnja.
// U odnosu na stari lokalni tip dobijamo opcioni `code?` (mašinski kod greške) + `isOk`.
export { ok, fail, isOk, type ActionResult } from "@tapizlabs/app-kit";
