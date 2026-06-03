"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { Logo } from "@/components/atoms/Logo";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workouts", label: "Workouts" },
];

export function Header({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden gap-1 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith(item.href)
                  ? "bg-accent/15 text-accent-glow"
                  : "text-muted hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">{user?.fullName}</span>
          <Button variant="secondary" type="button" className="text-xs" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
