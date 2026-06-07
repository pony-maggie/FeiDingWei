import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("local start script", () => {
  it("kills an existing local dev process before restarting", () => {
    const script = readFileSync("start-local.sh", "utf8");
    const mode = statSync("start-local.sh").mode;

    expect(mode & 0o111).not.toBe(0);
    expect(script).toContain('HOST="${HOST:-127.0.0.1}"');
    expect(script).toContain('PORT="${PORT:-3100}"');
    expect(script).toContain('lsof -tiTCP:"$PORT" -sTCP:LISTEN');
    expect(script).toContain('kill $PIDS');
    expect(script).toContain("npm run prisma:seed");
    expect(script).toContain('npm run dev -- --hostname "$HOST" --port "$PORT"');
  });

  it("exposes the script through npm for one-command startup", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["dev:local"]).toBe("./start-local.sh");
  });
});
