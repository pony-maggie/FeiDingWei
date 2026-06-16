"use client";

import { Check, ExternalLink, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Translation } from "@/lib/i18n";

type InboxNotification = {
  id: string;
  type: string;
  status: string;
  title: string;
  body: string;
  actor: { name: string } | null;
  room: { id: string; name: string };
  createdAt: Date;
};

type InboxData = {
  unread: InboxNotification[];
  read: InboxNotification[];
};

export function InboxPanel({
  inbox,
  labels
}: {
  inbox: InboxData;
  labels: Translation["inbox"];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function markRead(notificationId: string) {
    setPendingId(notificationId);
    await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" });
    setPendingId(null);
    router.refresh();
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Inbox className="h-5 w-5 text-accent" aria-hidden="true" />
          {labels.heading}
        </h1>
      </div>
      <NotificationSection
        title={labels.unread}
        emptyText={labels.emptyUnread}
        notifications={inbox.unread}
        labels={labels}
        pendingId={pendingId}
        onMarkRead={markRead}
      />
      <NotificationSection
        title={labels.read}
        emptyText={labels.emptyRead}
        notifications={inbox.read}
        labels={labels}
        pendingId={pendingId}
      />
    </section>
  );
}

function NotificationSection({
  title,
  emptyText,
  notifications,
  labels,
  pendingId,
  onMarkRead
}: {
  title: string;
  emptyText: string;
  notifications: InboxNotification[];
  labels: Translation["inbox"];
  pendingId: string | null;
  onMarkRead?: (notificationId: string) => Promise<void>;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {notifications.length === 0 ? (
        <div className="rounded border border-line bg-white p-4 text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article key={notification.id} className="rounded border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-500">
                    {notification.actor?.name ?? notification.type}
                  </div>
                  <h3 className="mt-1 text-sm font-semibold">{notification.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {notification.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <a
                    href={`/rooms/${notification.room.id}`}
                    className="inline-flex items-center gap-1 rounded border border-line px-3 py-2 text-xs font-medium text-slate-700 hover:bg-paper"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    {labels.openRoom} {notification.room.name}
                  </a>
                  {onMarkRead ? (
                    <button
                      type="button"
                      disabled={pendingId === notification.id}
                      onClick={() => onMarkRead(notification.id)}
                      className="inline-flex items-center gap-1 rounded bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {labels.markRead}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
