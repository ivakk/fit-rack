import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger:
    "inline-flex items-center justify-center rounded-xl border border-red-500/30 px-5 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50",
  ghost: "text-sm text-muted hover:text-accent-glow transition",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
