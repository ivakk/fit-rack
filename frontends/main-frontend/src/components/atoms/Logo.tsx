import Link from "next/link";

export function Logo({ href = "/dashboard", large }: { href?: string; large?: boolean }) {
  return (
    <Link
      href={href}
      className={`font-display font-bold tracking-tight text-white ${large ? "text-3xl" : "text-xl"}`}
    >
      Fi<span className="text-accent">Track</span>
    </Link>
  );
}
