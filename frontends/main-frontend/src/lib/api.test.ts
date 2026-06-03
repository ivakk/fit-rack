import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, authApi, workoutApi } from "./api";

describe("api client", () => {
  beforeEach(() => {
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

  it("workoutApi.remove handles 204 No Content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 }))
    );
    await expect(workoutApi.remove("t", "id-1")).resolves.toBeUndefined();
  });
});
