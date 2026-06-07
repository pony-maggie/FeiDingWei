import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("package scripts", () => {
  it("generates Next route types before TypeScript linting", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts.lint).toBe("next typegen && tsc --noEmit");
  });
});
