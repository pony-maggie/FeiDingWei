export type LlmRuntimeConfig =
  | {
      mode: "faux";
      reason: string;
    }
  | {
      mode: "openai";
      provider: "openai";
      model: string;
    };

type EnvLike = Record<string, string | undefined>;

const defaultOpenAiModel = "gpt-5.5";

function hasValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveLlmRuntimeConfig(env: EnvLike = process.env): LlmRuntimeConfig {
  const provider = env.FEIDINGWEI_LLM_PROVIDER?.trim().toLowerCase() || "faux";

  if (provider !== "openai") {
    return { mode: "faux", reason: "FEIDINGWEI_LLM_PROVIDER is not set to openai." };
  }

  if (!hasValue(env.OPENAI_API_KEY)) {
    return { mode: "faux", reason: "OPENAI_API_KEY is not configured." };
  }

  return {
    mode: "openai",
    provider: "openai",
    model: env.FEIDINGWEI_LLM_MODEL?.trim() || defaultOpenAiModel
  };
}
