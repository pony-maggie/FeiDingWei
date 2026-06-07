import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README runbook", () => {
  it("documents product positioning, Pi runtime, setup, and verification", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("Open source agent-native workspace for teams");
    expect(readme).toContain("@earendil-works/pi-ai");
    expect(readme).toContain("npm run prisma:migrate");
    expect(readme).toContain("npm run test:e2e");
  });
});
