import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./RegisterForm";
import { ApiError } from "@/lib/api";

const push = vi.fn();
const register = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ register }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits registration and navigates to dashboard", async () => {
    const user = userEvent.setup();
    register.mockResolvedValue(undefined);

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Full name"), "Alex Runner");
    await user.type(screen.getByLabelText("Email"), "alex@fitrack.test");
    await user.type(screen.getByLabelText("Phone"), "+1234");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "alex@fitrack.test",
          fullName: "Alex Runner",
          phoneNumber: "+1234",
          password: "secret123",
        })
      );
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows API error message", async () => {
    const user = userEvent.setup();
    register.mockRejectedValue(new ApiError("Email already in use", 409));

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Full name"), "Alex");
    await user.type(screen.getByLabelText("Email"), "dup@test.com");
    await user.type(screen.getByLabelText("Phone"), "+1");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
  });
});
