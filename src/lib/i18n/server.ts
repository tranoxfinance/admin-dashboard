import "server-only";
import { cookies } from "next/headers";
import {
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  type Dict,
  type Locale,
} from "./index";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}

export async function getDict(): Promise<Dict> {
  return dictionaries[await getLocale()];
}
