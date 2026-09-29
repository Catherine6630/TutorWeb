import "server-only";

import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, normalizeLanguage, type AppLanguage } from "@/lib/language";

export async function getLanguage(): Promise<AppLanguage> {
  const cookieStore = await cookies();
  return normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
}
