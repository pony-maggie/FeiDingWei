import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "blocked", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const agentRunStatusSchema = z.enum(["queued", "running", "completed", "failed"]);
export const artifactStatusSchema = z.enum(["draft", "active", "rejected"]);
export const notificationTypeSchema = z.enum([
  "mention",
  "assignment",
  "review_request",
  "agent_completed",
  "agent_failed",
  "returned_for_revision"
]);
export const notificationStatusSchema = z.enum(["unread", "read"]);
export const reviewStatusSchema = z.enum([
  "none",
  "requested",
  "approved",
  "changes_requested",
  "rejected"
]);
export const workspaceRoleSchema = z.enum(["owner", "admin", "member", "guest"]);
export const roomRoleSchema = z.enum(["room_lead", "contributor", "reviewer", "viewer"]);
export const functionLabelSchema = z.enum([
  "business",
  "product",
  "engineering",
  "design",
  "qa",
  "ops"
]);

export const messageInputSchema = z.object({
  body: z.string().trim().min(1, "Message is required")
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type AgentRunStatus = z.infer<typeof agentRunStatusSchema>;
export type ArtifactStatus = z.infer<typeof artifactStatusSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export type RoomRole = z.infer<typeof roomRoleSchema>;
export type FunctionLabel = z.infer<typeof functionLabelSchema>;

export type DefaultAgent = {
  slug: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
};

export const defaultAgents: DefaultAgent[] = [
  {
    slug: "pm-agent",
    name: "PM Agent",
    role: "Product manager",
    description: "Summarizes discussions, drafts PRDs, and creates draft task lists.",
    capabilities: ["summarize_discussion", "draft_prd", "create_tasks"]
  },
  {
    slug: "doc-agent",
    name: "Doc Agent",
    role: "Documentation partner",
    description: "Turns rough discussion into readable notes, specs, and summaries.",
    capabilities: ["write_notes", "write_spec", "rewrite_summary"]
  },
  {
    slug: "review-agent",
    name: "Review Agent",
    role: "Project reviewer",
    description: "Finds blockers, missing owners, unclear scope, and stale tasks.",
    capabilities: ["review_tasks", "find_blockers", "prepare_status"]
  }
];

export function extractAgentSlug(body: string): string | null {
  const mention = body.match(/@(PMAgent|DocAgent|ReviewAgent)\b/i)?.[1]?.toLowerCase();

  if (!mention) {
    return null;
  }

  const aliases: Record<string, string> = {
    pmagent: "pm-agent",
    docagent: "doc-agent",
    reviewagent: "review-agent"
  };

  return aliases[mention] ?? null;
}

export function mentionTokenForAgentSlug(slug: string): string {
  const tokens: Record<string, string> = {
    "pm-agent": "@PMAgent",
    "doc-agent": "@DocAgent",
    "review-agent": "@ReviewAgent"
  };

  return tokens[slug] ?? `@${slug}`;
}

export function mentionTokenForUser(user: { email: string }): string {
  const localPart = user.email.split("@")[0]?.trim().toLowerCase();
  return `@${localPart}`;
}
