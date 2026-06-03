import type { TokenPair } from "./types";

const ACCESS = "fitrack.accessToken";
const REFRESH = "fitrack.refreshToken";

export function saveTokens(tokens: TokenPair) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS, tokens.accessToken);
  localStorage.setItem(REFRESH, tokens.refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}
