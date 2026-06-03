type Tone = "error" | "info";

const tones: Record<Tone, string> = {
  error: "rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400",
  info: "rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-glow",
};

export function Alert({ tone = "error", children }: { tone?: Tone; children: React.ReactNode }) {
  return <p className={tones[tone]}>{children}</p>;
}
