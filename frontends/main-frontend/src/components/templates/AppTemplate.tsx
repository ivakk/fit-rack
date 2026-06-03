"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/organisms/Header";
import { ProtectedGate } from "@/components/organisms/ProtectedGate";
import { useAuth } from "@/context/AuthContext";

export function AppTemplate({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <ProtectedGate>
      <div className="min-h-screen">
        <Header
          onSignOut={() => {
            logout();
            router.push("/login");
          }}
        />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </ProtectedGate>
  );
}
