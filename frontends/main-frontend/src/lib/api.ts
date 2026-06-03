import type { CreateWorkoutPayload, TokenPair, UpdateWorkoutPayload, User, Workout } from "./types";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./auth-storage";

/** Traefik API gateway — all browser traffic goes here, not to service ports. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(res: Response): Promise<string> {
  let detail = res.statusText;
  try {
    const json = await res.json();
    detail =
      (json as { error?: string; message?: string }).error
      ?? (json as { message?: string }).message
      ?? detail;
  } catch {
    /* empty */
  }
  return detail;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  retried = false
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && token && !retried && !path.startsWith("/auth/")) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      return request<T>(path, options, refreshed, true);
    }
  }

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

async function tryRefreshTokens(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return null;
  }
  try {
    const tokens = await authApi.refresh(refresh);
    saveTokens(tokens);
    return tokens.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    gender: string;
  }) => request<TokenPair>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  refresh: (refreshToken: string) =>
    request<TokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  me: (token: string) => request<User>("/auth/me", {}, token),

  deleteAccount: (token: string) =>
    request<void>("/auth/me", { method: "DELETE" }, token),
};

export const workoutApi = {
  list: (token: string) => request<Workout[]>("/workouts", {}, token),

  get: (token: string, id: string) => request<Workout>(`/workouts/${id}`, {}, token),

  create: (token: string, body: CreateWorkoutPayload) =>
    request<Workout>("/workouts", { method: "POST", body: JSON.stringify(body) }, token),

  update: (token: string, id: string, body: UpdateWorkoutPayload) =>
    request<Workout>(`/workouts/${id}`, { method: "PUT", body: JSON.stringify(body) }, token),

  remove: (token: string, id: string) =>
    request<void>(`/workouts/${id}`, { method: "DELETE" }, token),
};
