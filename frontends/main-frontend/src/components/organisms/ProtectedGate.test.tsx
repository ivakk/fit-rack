import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedGate } from "./ProtectedGate";

const replace = vi.fn();
const useAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuth(),
}));

describe("ProtectedGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows spinner while loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    render(
      <ProtectedGate>
        <p>Secret</p>
      </ProtectedGate>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", async () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    render(
      <ProtectedGate>
        <p>Secret</p>
      </ProtectedGate>
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login");
    });
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuth.mockReturnValue({
      user: { id: "1", email: "a@test.com", fullName: "Alex", role: "MEMBER" },
      loading: false,
    });
    render(
      <ProtectedGate>
        <p>Secret</p>
      </ProtectedGate>
    );
    expect(screen.getByText("Secret")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
