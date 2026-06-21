import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";
import { ApiError } from "@/lib/api";

const push = vi.fn();
const login = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ login }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits credentials and navigates to dashboard", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "a@test.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("a@test.com", "secret123");
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows API error message", async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(new ApiError("Invalid credentials", 401));

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "a@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows generic error for unknown failures", async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(new Error("network"));

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "a@test.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Login failed")).toBeInTheDocument();
  });
});
