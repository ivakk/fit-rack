export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-glow">
      {children}
    </span>
  );
}
