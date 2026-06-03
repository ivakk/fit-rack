import type { AnchorHTMLAttributes, ReactNode } from "react";

export default function MockLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
