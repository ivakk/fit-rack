"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { isLoggedIn } from "@/lib/auth-storage";

export default function HomePage() {
  const router = useRouter();
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(isLoggedIn() ? "/dashboard" : "/login");
    }
  }, [loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
    </div>
  );
}
