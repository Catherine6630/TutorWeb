export const LANGUAGE_COOKIE = "tutor-language";
export const DEFAULT_LANGUAGE = "en" as const;

export type AppLanguage = "en" | "zh";

export function normalizeLanguage(value: string | null | undefined): AppLanguage {
  return value === "zh" ? "zh" : DEFAULT_LANGUAGE;
}

export function localeFor(language: AppLanguage): string {
  return language === "zh" ? "zh-CN" : "en-NZ";
}
