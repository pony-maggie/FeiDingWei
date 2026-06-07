import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README runbook", () => {
  it("documents Chinese-first product positioning, deployment, setup, and verification", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("开源的 Agent 原生团队协作空间");
    expect(readme).toContain("当前 v0 是纯 Web 端应用");
    expect(readme).toContain("私有化部署优先");
    expect(readme).toContain("v0 默认不需要大模型 API key");
    expect(readme).toContain("@earendil-works/pi-ai");
    expect(readme).toContain("npm run prisma:migrate");
    expect(readme).toContain("npm run test:e2e");
  });

  it("provides an English README with the same runbook guarantees", () => {
    const readme = readFileSync("README.en.md", "utf8");

    expect(readme).toContain("Open source agent-native workspace for teams");
    expect(readme).toContain("The current v0 is a pure Web application");
    expect(readme).toContain("Private deployment first");
    expect(readme).toContain("v0 does not require a model API key by default");
    expect(readme).toContain("@earendil-works/pi-ai");
    expect(readme).toContain("npm run prisma:migrate");
    expect(readme).toContain("npm run test:e2e");
  });
});
