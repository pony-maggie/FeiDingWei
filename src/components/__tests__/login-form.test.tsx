import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../login-form";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("LoginForm", () => {
  it("submits the selected email to the login endpoint", async () => {
    const onLoggedIn = vi.fn();
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <LoginForm
        demoUsers={[
          { name: "Founder", email: "founder@feidingwei.local" },
          { name: "Product", email: "product@feidingwei.local" }
        ]}
        onLoggedIn={onLoggedIn}
      />
    );

    await userEvent.selectOptions(screen.getByLabelText("选择登录用户"), "product@feidingwei.local");
    await userEvent.click(screen.getByRole("button", { name: "进入飞钉微" }));

    await waitFor(() => expect(onLoggedIn).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "product@feidingwei.local" })
    });
  });

  it("shows an error when login fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));

    render(
      <LoginForm demoUsers={[{ name: "Founder", email: "founder@feidingwei.local" }]} />
    );

    await userEvent.click(screen.getByRole("button", { name: "进入飞钉微" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("登录失败，请重试。");
  });
});
