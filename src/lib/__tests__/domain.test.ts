import { describe, expect, it } from "vitest";
import {
  agentRunStatusSchema,
  artifactStatusSchema,
  defaultAgents,
  extractAgentSlug,
  messageInputSchema,
  taskStatusSchema
} from "../domain";

describe("domain schemas", () => {
  it("accepts valid task statuses", () => {
    expect(taskStatusSchema.parse("todo")).toBe("todo");
    expect(taskStatusSchema.parse("in_progress")).toBe("in_progress");
    expect(taskStatusSchema.parse("blocked")).toBe("blocked");
    expect(taskStatusSchema.parse("done")).toBe("done");
  });

  it("rejects empty messages", () => {
    expect(() => messageInputSchema.parse({ body: "" })).toThrow();
  });

  it("defines the required default agents", () => {
    expect(defaultAgents.map((agent) => agent.slug)).toEqual([
      "pm-agent",
      "doc-agent",
      "review-agent"
    ]);
  });

  it("accepts agent run lifecycle states", () => {
    expect(agentRunStatusSchema.options).toEqual([
      "queued",
      "running",
      "completed",
      "failed"
    ]);
  });

  it("accepts generated artifact lifecycle states", () => {
    expect(artifactStatusSchema.options).toEqual(["draft", "active", "rejected"]);
  });

  it("extracts supported agent mentions from chat messages", () => {
    expect(extractAgentSlug("@PMAgent summarize this")).toBe("pm-agent");
    expect(extractAgentSlug("please @DocAgent write notes")).toBe("doc-agent");
    expect(extractAgentSlug("@ReviewAgent find blockers")).toBe("review-agent");
    expect(extractAgentSlug("@UnknownAgent do work")).toBeNull();
  });
});
