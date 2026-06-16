import { describe, expect, it } from "vitest";
import { resolveLlmRuntimeConfig } from "../llm-config";

describe("LLM runtime config", () => {
  it("uses deterministic faux provider when no real provider key is configured", () => {
    const config = resolveLlmRuntimeConfig({
      FEIDINGWEI_LLM_PROVIDER: "openai",
      FEIDINGWEI_LLM_MODEL: "gpt-5.5",
      OPENAI_API_KEY: ""
    });

    expect(config).toEqual({
      mode: "faux",
      reason: "OPENAI_API_KEY is not configured."
    });
  });

  it("uses OpenAI through Pi when OPENAI_API_KEY is configured", () => {
    const config = resolveLlmRuntimeConfig({
      FEIDINGWEI_LLM_PROVIDER: "openai",
      FEIDINGWEI_LLM_MODEL: "gpt-5.5",
      OPENAI_API_KEY: "sk-test-key"
    });

    expect(config).toEqual({
      mode: "openai",
      provider: "openai",
      model: "gpt-5.5"
    });
    expect(JSON.stringify(config)).not.toContain("sk-test-key");
  });
});
