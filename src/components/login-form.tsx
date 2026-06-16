"use client";

import { LogIn } from "lucide-react";
import { useState } from "react";

type DemoUser = {
  name: string;
  email: string;
};

export function LoginForm({
  demoUsers,
  onLoggedIn
}: {
  demoUsers: DemoUser[];
  onLoggedIn?: () => void;
}) {
  const [email, setEmail] = useState(demoUsers[0]?.email ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("登录失败，请重试。");
      return;
    }

    if (onLoggedIn) {
      onLoggedIn();
      return;
    }

    window.location.assign("/");
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded border border-line bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-ink">登录飞钉微</h1>
        <p className="mt-1 text-sm text-slate-600">选择一个本地演示用户进入 V2 协作空间。</p>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        选择登录用户
        <select
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded border border-line px-3 py-2 text-sm text-ink"
        >
          {demoUsers.map((user) => (
            <option key={user.email} value={user.email}>
              {user.name} · {user.email}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      <button
        disabled={!email || isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        进入飞钉微
      </button>
    </form>
  );
}
