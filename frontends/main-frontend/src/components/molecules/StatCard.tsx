import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";

export function StatCard({
  label,
  value,
  children,
}: {
  label: string;
  value: string | number;
  children?: React.ReactNode;
}) {
  return (
    <Card className={children ? "sm:col-span-2 flex flex-col justify-center" : ""}>
      <Text variant="caption">{label}</Text>
      <p className="mt-2 font-display text-3xl font-bold text-accent-glow">{value}</p>
      {children}
    </Card>
  );
}
