import { describe, expect, it } from "vitest";
import { DEFAULT_LANGUAGE, localeFor, normalizeLanguage } from "@/lib/language";

describe("language preferences", () => {
  it("defaults to English", () => {
    expect(DEFAULT_LANGUAGE).toBe("en");
    expect(normalizeLanguage(undefined)).toBe("en");
    expect(normalizeLanguage("unsupported")).toBe("en");
  });

  it("keeps the supported Chinese preference", () => {
    expect(normalizeLanguage("zh")).toBe("zh");
    expect(localeFor("zh")).toBe("zh-CN");
    expect(localeFor("en")).toBe("en-NZ");
  });
});
