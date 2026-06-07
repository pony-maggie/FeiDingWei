"use client";

import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Translation } from "@/lib/i18n";

type RoomTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  artifactStatus: string;
};

export function TasksPanel({
  tasks,
  labels
}: {
  tasks: RoomTask[];
  labels: Translation["tasks"];
}) {
  const router = useRouter();

  async function approve(taskId: string) {
    await fetch(`/api/tasks/${taskId}/approve`, { method: "POST" });
    router.refresh();
  }

  return (
    <section className="space-y-3 p-4">
      <h2 className="text-lg font-semibold">{labels.heading}</h2>
      {tasks.map((task) => (
        <article key={task.id} className="rounded border border-line bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{task.title}</div>
              <p className="mt-1 text-sm text-slate-600">{task.description}</p>
              <div className="mt-2 text-xs text-slate-500">
                {labels.status[task.status as keyof typeof labels.status] ?? task.status} ·{" "}
                {labels.priority[task.priority as keyof typeof labels.priority] ?? task.priority} ·{" "}
                {labels.artifactStatus[
                  task.artifactStatus as keyof typeof labels.artifactStatus
                ] ?? task.artifactStatus}
              </div>
            </div>
            {task.artifactStatus === "draft" ? (
              <button
                onClick={() => approve(task.id)}
                className="inline-flex shrink-0 items-center gap-2 rounded border border-line px-3 py-2 text-sm"
              >
                <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                {labels.approve}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
