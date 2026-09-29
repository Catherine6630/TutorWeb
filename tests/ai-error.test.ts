import { describe, expect, it } from "vitest";
import { toPublicAiError } from "@/lib/ai-error";

describe("toPublicAiError", () => {
  it("distinguishes exhausted quota from temporary rate limiting", () => {
    expect(toPublicAiError({ status: 429, code: "insufficient_quota" })).toMatchObject({
      code: "AI_QUOTA_EXHAUSTED",
    });
    expect(toPublicAiError({ status: 429, code: "rate_limit_exceeded" })).toMatchObject({
      code: "AI_RATE_LIMITED",
    });
  });

  it("reads billing error details nested in an SDK error", () => {
    expect(
      toPublicAiError({
        status: 429,
        error: { code: "project_spend_limit_exceeded", type: "insufficient_quota" },
      }, "zh"),
    ).toEqual({
      code: "AI_QUOTA_EXHAUSTED",
      message: "AI 服务当前没有可用额度。请联系管理员检查 OpenAI Billing、项目预算和 Usage Limits。",
    });
  });

  it("uses English by default", () => {
    expect(toPublicAiError({ status: 401 })).toEqual({
      code: "AI_AUTH_INVALID",
      message: "The OpenAI API key is invalid or inactive. Ask an administrator to update it.",
    });
  });

  it("recognizes quota failures when a stream only preserves the error message", () => {
    expect(
      toPublicAiError(new Error("You exceeded your current quota, please check your plan and billing details.")),
    ).toMatchObject({ code: "AI_QUOTA_EXHAUSTED" });
  });

  it("provides actionable messages for authentication and model errors", () => {
    expect(toPublicAiError({ status: 401 })).toMatchObject({ code: "AI_AUTH_INVALID" });
    expect(toPublicAiError({ status: 404 })).toMatchObject({ code: "AI_MODEL_UNAVAILABLE" });
  });

  it("does not expose unknown provider errors", () => {
    const result = toPublicAiError(new Error("provider secret diagnostic"));
    expect(result.code).toBe("AI_SERVICE_UNAVAILABLE");
    expect(result.message).not.toContain("provider secret diagnostic");
  });
});
