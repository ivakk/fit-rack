import Link from "next/link";

export function AuthPromptLink({
  message,
  linkHref,
  linkLabel,
}: {
  message: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <p className="text-center text-sm text-muted">
      {message}{" "}
      <Link href={linkHref} className="font-medium text-accent-glow hover:underline">
        {linkLabel}
      </Link>
    </p>
  );
}
