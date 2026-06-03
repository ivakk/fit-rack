import type { CreateWorkoutPayload, TokenPair, UpdateWorkoutPayload, User, Workout } from "./types";

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

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // Identity is injected by Traefik + IAM — never send X-User-Id from the browser.

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const json = await res.json();
      detail = (json as { error?: string; message?: string }).error
        ?? (json as { message?: string }).message
        ?? detail;
    } catch {
      /* empty */
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
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
