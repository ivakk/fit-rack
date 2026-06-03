import { Card } from "@/components/atoms/Card";
import { Logo } from "@/components/atoms/Logo";
import { Text } from "@/components/atoms/Text";

export function AuthTemplate({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <Logo href="/" large />
        <Text variant="h2" className="mt-6">
          {title}
        </Text>
        <Text variant="muted" className="mt-2">
          {subtitle}
        </Text>
      </div>
      <Card className="w-full max-w-md shadow-glow">{children}</Card>
    </div>
  );
}
