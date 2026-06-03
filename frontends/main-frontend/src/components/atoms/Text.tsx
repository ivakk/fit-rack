import { HTMLAttributes } from "react";

type Variant = "h1" | "h2" | "h3" | "body" | "muted" | "caption";

const styles: Record<Variant, string> = {
  h1: "font-display text-3xl font-bold tracking-tight",
  h2: "font-display text-xl font-semibold",
  h3: "font-display text-lg font-semibold",
  body: "text-sm text-white/90",
  muted: "text-sm text-muted",
  caption: "text-xs uppercase tracking-wider text-muted",
};

export function Text({
  variant = "body",
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { variant?: Variant }) {
  return <p className={`${styles[variant]} ${className}`.trim()} {...props} />;
}
