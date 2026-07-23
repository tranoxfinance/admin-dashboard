import { en } from "./en";
import { fr } from "./fr";
import type { Dict } from "./en";

export type { Dict };

export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];

export const LOCALE_COOKIE = "admin_locale";

export const dictionaries: Record<Locale, Dict> = { en, fr };

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "fr";
}

export function describeApiError(dict: Dict, error: string | undefined) {
  if (!error) {
    return dict.errors.fallback;
  }
  return dict.errors[error] ?? dict.errors.fallback;
}
