import { describe, expect, it } from "vitest";
import { metadata } from "../layout";

describe("root layout metadata", () => {
  it("identifies FeiDingWei as an agent-native workspace", () => {
    expect(metadata.title).toBe("FeiDingWei");
    expect(metadata.description).toBe("Open source agent-native workspace for teams");
  });
});
