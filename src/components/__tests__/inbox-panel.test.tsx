import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { translations } from "@/lib/i18n";
import { InboxPanel } from "../inbox-panel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const inbox = {
  unread: [
    {
      id: "notification-1",
      type: "mention",
      status: "unread",
      title: "Business mentioned you",
      body: "@product please review this customer request",
      actor: { name: "Business" },
      room: { id: "room-1", name: "Agent Project Room" },
      createdAt: new Date("2026-06-14T12:00:00.000Z")
    }
  ],
  read: [
    {
      id: "notification-2",
      type: "assignment",
      status: "read",
      title: "Engineer assigned you a task",
      body: "Please own the API follow-up.",
      actor: { name: "Engineer" },
      room: { id: "room-1", name: "Agent Project Room" },
      createdAt: new Date("2026-06-14T11:00:00.000Z")
    }
  ]
};

describe("InboxPanel", () => {
  it("renders unread and read notifications with room links", () => {
    render(<InboxPanel inbox={inbox} labels={translations.en.inbox} />);

    expect(screen.getByRole("heading", { name: "Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Unread" })).toBeInTheDocument();
    expect(screen.getByText("Business mentioned you")).toBeInTheDocument();
    expect(screen.getByText("@product please review this customer request")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open Agent Project Room" })[0]).toHaveAttribute(
      "href",
      "/rooms/room-1"
    );
    expect(screen.getByRole("heading", { name: "Read" })).toBeInTheDocument();
    expect(screen.getByText("Engineer assigned you a task")).toBeInTheDocument();
  });

  it("marks unread notifications as read", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<InboxPanel inbox={inbox} labels={translations.en.inbox} />);

    await userEvent.click(screen.getByRole("button", { name: "Mark as read" }));

    expect(fetch).toHaveBeenCalledWith("/api/notifications/notification-1/read", {
      method: "POST"
    });
  });
});
