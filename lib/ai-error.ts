import { DEFAULT_LANGUAGE, type AppLanguage } from "@/lib/language";

export type PublicAiErrorCode =
  | "AI_QUOTA_EXHAUSTED"
  | "AI_RATE_LIMITED"
  | "AI_AUTH_INVALID"
  | "AI_ACCESS_DENIED"
  | "AI_MODEL_UNAVAILABLE"
  | "AI_REQUEST_INVALID"
  | "AI_CONNECTION_FAILED"
  | "AI_SERVICE_UNAVAILABLE";

export type PublicAiError = {
  code: PublicAiErrorCode;
  message: string;
};

type ErrorRecord = Record<string, unknown>;

const quotaCodes = new Set([
  "credit_balance_exhausted",
  "organization_spend_limit_exceeded",
  "project_spend_limit_exceeded",
  "organization_usage_limit_exceeded",
  "insufficient_quota",
]);

function asRecord(value: unknown): ErrorRecord | null {
  return typeof value === "object" && value !== null ? value as ErrorRecord : null;
}

function stringValue(record: ErrorRecord | null, key: string): string {
  const value = record?.[key];
  return typeof value === "string" ? value : "";
}

function numberValue(record: ErrorRecord | null, key: string): number | null {
  const value = record?.[key];
  return typeof value === "number" ? value : null;
}

export function toPublicAiError(error: unknown, language: AppLanguage = DEFAULT_LANGUAGE): PublicAiError {
  const record = asRecord(error);
  const nested = asRecord(record?.error);
  const status = numberValue(record, "status") ?? numberValue(nested, "status");
  const code = stringValue(record, "code") || stringValue(nested, "code");
  const type = stringValue(record, "type") || stringValue(nested, "type");
  const name = stringValue(record, "name");
  const message = stringValue(record, "message") || stringValue(nested, "message");
  const normalizedMessage = message.toLowerCase();

  const quotaFailure =
    quotaCodes.has(code) ||
    quotaCodes.has(type) ||
    /current quota|credit balance|spend limit|usage limit|billing/.test(normalizedMessage);

  if (quotaFailure) {
    return {
      code: "AI_QUOTA_EXHAUSTED",
      message: language === "zh" ? "AI 服务当前没有可用额度。请联系管理员检查 OpenAI Billing、项目预算和 Usage Limits。" : "The AI service has no available quota. Ask an administrator to check OpenAI billing, the project budget, and usage limits.",
    };
  }

  if (status === 429) {
    return {
      code: "AI_RATE_LIMITED",
      message: language === "zh" ? "AI 请求过于频繁，请稍后再试。" : "Too many AI requests were sent. Please try again shortly.",
    };
  }

  if (status === 401) {
    return {
      code: "AI_AUTH_INVALID",
      message: language === "zh" ? "OpenAI API 密钥无效或已失效，请联系管理员更新配置。" : "The OpenAI API key is invalid or inactive. Ask an administrator to update it.",
    };
  }

  if (status === 403) {
    return {
      code: "AI_ACCESS_DENIED",
      message: language === "zh" ? "当前 OpenAI 项目无权执行此请求，请联系管理员检查项目权限。" : "The current OpenAI project is not authorised for this request. Ask an administrator to review project permissions.",
    };
  }

  if (status === 404 || /model.+(not found|does not exist|access)/.test(normalizedMessage)) {
    return {
      code: "AI_MODEL_UNAVAILABLE",
      message: language === "zh" ? "配置的 AI 模型不存在或当前项目无权访问，请联系管理员检查 OPENAI_MODEL。" : "The configured AI model is unavailable to this project. Ask an administrator to check OPENAI_MODEL.",
    };
  }

  if (status === 400 || status === 422) {
    return {
      code: "AI_REQUEST_INVALID",
      message: language === "zh" ? "AI 请求配置不兼容，请联系管理员检查模型和 API 参数。" : "The AI request configuration is incompatible. Ask an administrator to check the model and API parameters.",
    };
  }

  if (
    name === "APIConnectionError" ||
    name === "APIConnectionTimeoutError" ||
    /connection|network|timed? out|timeout/.test(normalizedMessage)
  ) {
    return {
      code: "AI_CONNECTION_FAILED",
      message: language === "zh" ? "无法连接到 AI 服务，请检查网络后重试。" : "Unable to connect to the AI service. Check the network and try again.",
    };
  }

  return {
    code: "AI_SERVICE_UNAVAILABLE",
    message: language === "zh" ? "AI 暂时无法完成回答，请稍后重试。" : "AI could not complete the answer. Please try again later.",
  };
}
