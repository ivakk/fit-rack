"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api";
import {
  clearTokens,
  getAccessToken,
  isLoggedIn,
  saveTokens,
} from "@/lib/auth-storage";
import type { TokenPair, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    gender: string;
  }) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me(token);
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn()) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const applyTokens = useCallback(
    async (tokens: TokenPair) => {
      saveTokens(tokens);
      const me = await authApi.me(tokens.accessToken);
      setUser(me);
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login({ email, password });
      await applyTokens(tokens);
    },
    [applyTokens]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      phoneNumber: string;
      gender: string;
    }) => {
      const tokens = await authApi.register(data);
      await applyTokens(tokens);
    },
    [applyTokens]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    await authApi.deleteAccount(token);
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      deleteAccount,
      refreshUser: loadUser,
    }),
    [user, loading, login, register, logout, deleteAccount, loadUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
