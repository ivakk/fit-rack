import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { ApiError } from "@/lib/api";

const replace = vi.fn();
const deleteAccount = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ deleteAccount }),
}));

describe("DeleteAccountSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("deletes account and redirects when confirmed", async () => {
    const user = userEvent.setup();
    deleteAccount.mockResolvedValue(undefined);

    render(<DeleteAccountSection />);
    await user.click(screen.getByRole("button", { name: "Delete my account" }));

    await waitFor(() => {
      expect(deleteAccount).toHaveBeenCalled();
      expect(replace).toHaveBeenCalledWith("/register");
    });
  });

  it("does nothing when confirm is cancelled", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", vi.fn(() => false));

    render(<DeleteAccountSection />);
    await user.click(screen.getByRole("button", { name: "Delete my account" }));

    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("shows error when delete fails", async () => {
    const user = userEvent.setup();
    deleteAccount.mockRejectedValue(new ApiError("Server error", 500));

    render(<DeleteAccountSection />);
    await user.click(screen.getByRole("button", { name: "Delete my account" }));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });
});
