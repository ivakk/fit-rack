import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as authStorage from "./auth-storage";
import { ApiError, authApi, workoutApi } from "./api";

describe("api client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("authApi.register posts JSON to /auth/register", async () => {
    const body = {
      email: "a@b.com",
      password: "secret",
      fullName: "Alex",
      phoneNumber: "1",
      gender: "other",
    };
    await authApi.register(body);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
  });

  it("workoutApi.list sends Authorization header", async () => {
    await workoutApi.list("token-abc");
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get("Authorization")).toBe("Bearer token-abc");
  });

  it("throws ApiError with server message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          statusText: "Unauthorized",
        })
      )
    );
    await expect(authApi.login({ email: "a@b.com", password: "x" })).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Invalid credentials",
        status: 401,
      })
    );
  });

  it("workoutApi.update sends PUT with exercises", async () => {
    await workoutApi.update("t", "w-1", {
      exercises: [{ name: "Squat", sets: 3, reps: 10 }],
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/workouts/w-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          exercises: [{ name: "Squat", sets: 3, reps: 10 }],
        }),
      })
    );
  });

  it("workoutApi.remove handles 204 No Content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 }))
    );
    await expect(workoutApi.remove("t", "id-1")).resolves.toBeUndefined();
  });

  it("authApi.me sends Authorization header", async () => {
    await authApi.me("token-abc");
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get("Authorization")).toBe("Bearer token-abc");
  });

  it("authApi.refresh posts refresh token body", async () => {
    await authApi.refresh("refresh-1");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/auth/refresh",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refreshToken: "refresh-1" }),
      })
    );
  });

  it("uses message field when error is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ message: "Bad gateway" }), {
          status: 502,
          statusText: "Bad Gateway",
        })
      )
    );
    await expect(workoutApi.list("t")).rejects.toEqual(
      expect.objectContaining({
        message: "Bad gateway",
        status: 502,
      })
    );
  });

  it("retries once after refreshing token on 401", async () => {
    vi.spyOn(authStorage, "getRefreshToken").mockReturnValue("refresh-old");
    vi.spyOn(authStorage, "saveTokens").mockImplementation(() => {});
    vi.spyOn(authStorage, "clearTokens").mockImplementation(() => {});

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "expired" }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: "new-access", refreshToken: "new-refresh" }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "w1" }]), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await workoutApi.list("old-access");
    expect(result).toEqual([{ id: "w1" }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
