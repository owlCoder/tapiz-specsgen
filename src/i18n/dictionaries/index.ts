import { sr } from "./sr";
import { srCyrl } from "./sr-Cyrl";
import { en } from "./en";
import { fr } from "./fr";
import { hu } from "./hu";
import type { Locale } from "../config";

export type { Dict } from "./sr";

export const DICTIONARIES: Record<Locale, typeof sr> = {
  sr,
  "sr-Cyrl": srCyrl,
  en,
  fr,
  hu,
};
