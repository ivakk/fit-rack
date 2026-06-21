import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isLoggedIn,
  saveTokens,
} from "./auth-storage";

describe("auth-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saveTokens and getAccessToken round-trip", () => {
    saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    expect(getAccessToken()).toBe("access-1");
    expect(isLoggedIn()).toBe(true);
  });

  it("clearTokens removes session", () => {
    saveTokens({ accessToken: "a", refreshToken: "r" });
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });

  it("getRefreshToken round-trips", () => {
    saveTokens({ accessToken: "a", refreshToken: "refresh-xyz" });
    expect(getRefreshToken()).toBe("refresh-xyz");
  });
});
