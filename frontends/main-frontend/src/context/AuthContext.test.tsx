import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { mockUser } from "@/test/test-utils";

const me = vi.fn();
const login = vi.fn();
const register = vi.fn();
const deleteAccountApi = vi.fn();

vi.mock("@/lib/api", () => ({
  authApi: {
    me: (...args: unknown[]) => me(...args),
    login: (...args: unknown[]) => login(...args),
    register: (...args: unknown[]) => register(...args),
    deleteAccount: (...args: unknown[]) => deleteAccountApi(...args),
  },
}));

const getAccessToken = vi.fn();
const getRefreshToken = vi.fn();
const saveTokens = vi.fn();
const clearTokens = vi.fn();
const isLoggedIn = vi.fn();

vi.mock("@/lib/auth-storage", () => ({
  getAccessToken: () => getAccessToken(),
  getRefreshToken: () => getRefreshToken(),
  saveTokens: (...args: unknown[]) => saveTokens(...args),
  clearTokens: () => clearTokens(),
  isLoggedIn: () => isLoggedIn(),
}));

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="email">{auth.user?.email ?? "none"}</span>
      <button type="button" onClick={() => auth.login("a@test.com", "secret")}>
        login
      </button>
      <button type="button" onClick={() => auth.logout()}>logout</button>
      <button type="button" onClick={() => auth.deleteAccount()}>delete</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn.mockReturnValue(false);
    getAccessToken.mockReturnValue(null);
  });

  it("starts logged out when no token", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("loads user when token exists", async () => {
    isLoggedIn.mockReturnValue(true);
    getAccessToken.mockReturnValue("token-1");
    me.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("email")).toHaveTextContent("alex@fitrack.test");
    });
    expect(me).toHaveBeenCalledWith("token-1");
  });

  it("clears tokens when me fails", async () => {
    isLoggedIn.mockReturnValue(true);
    getAccessToken.mockReturnValue("bad-token");
    me.mockRejectedValue(new Error("401"));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(clearTokens).toHaveBeenCalled();
      expect(screen.getByTestId("email")).toHaveTextContent("none");
    });
  });

  it("login saves tokens and sets user", async () => {
    login.mockResolvedValue({ accessToken: "a", refreshToken: "r" });
    me.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    screen.getByRole("button", { name: "login" }).click();

    await waitFor(() => {
      expect(saveTokens).toHaveBeenCalledWith({ accessToken: "a", refreshToken: "r" });
      expect(screen.getByTestId("email")).toHaveTextContent("alex@fitrack.test");
    });
  });

  it("logout clears session", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    screen.getByRole("button", { name: "logout" }).click();

    expect(clearTokens).toHaveBeenCalled();
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("deleteAccount clears session after API call", async () => {
    getAccessToken.mockReturnValue("token-1");
    deleteAccountApi.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    screen.getByRole("button", { name: "delete" }).click();

    await waitFor(() => {
      expect(deleteAccountApi).toHaveBeenCalledWith("token-1");
      expect(clearTokens).toHaveBeenCalled();
    });
  });

  it("useAuth throws outside provider", () => {
    expect(() => render(<Probe />)).toThrow("useAuth must be used within AuthProvider");
  });
});
