import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README runbook", () => {
  it("documents Chinese-first product positioning, deployment, setup, and verification", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("开源的 Agent 原生团队协作空间");
    expect(readme).toContain("正面对标飞书、钉钉、企业微信这三个不开源的巨头");
    expect(readme).toContain("人不是默认最重要的界面中心");
    expect(readme).toContain("私有化部署优先");
    expect(readme).toContain("v0 默认不需要大模型 API key");
    expect(readme).toContain("FEIDINGWEI_LLM_PROVIDER");
    expect(readme).toContain("OPENAI_API_KEY");
    expect(readme).toContain("gpt-5.5");
    expect(readme).toContain("可记录、可审查、可回放的执行链路");
    expect(readme).toContain("工具调用按顺序执行");
    expect(readme).toContain("所有生成结果默认是 `draft`");
    expect(readme).toContain("npm run prisma:migrate");
    expect(readme).not.toContain("飞钉微复用 Pi 做通用 Agent 基础设施");
  });

  it("provides an English README with the same runbook guarantees", () => {
    const readme = readFileSync("README.en.md", "utf8");

    expect(readme).toContain("Open source agent-native workspace for teams");
    expect(readme).toContain("benchmark against Feishu, DingTalk, and WeCom");
    expect(readme).toContain("humans are not the default center of the interface");
    expect(readme).toContain("Private deployment first");
    expect(readme).toContain("v0 does not require a model API key by default");
    expect(readme).toContain("FEIDINGWEI_LLM_PROVIDER");
    expect(readme).toContain("OPENAI_API_KEY");
    expect(readme).toContain("gpt-5.5");
    expect(readme).toContain("execution chain that can be recorded, reviewed, and replayed");
    expect(readme).toContain("Tool calls run sequentially");
    expect(readme).toContain("every generated artifact starts as `draft`");
    expect(readme).not.toContain("FeiDingWei uses Pi for generic agent infrastructure");
    expect(readme).toContain("npm run prisma:migrate");
  });
});
