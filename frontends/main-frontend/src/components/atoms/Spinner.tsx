export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent ${className}`.trim()}
    />
  );
}
