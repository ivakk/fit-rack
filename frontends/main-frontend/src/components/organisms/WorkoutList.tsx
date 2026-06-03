import Link from "next/link";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { WorkoutCard } from "@/components/organisms/WorkoutCard";
import type { Workout } from "@/lib/types";

export function WorkoutList({
  workouts,
  loading,
  error,
}: {
  workouts: Workout[];
  loading: boolean;
  error: string | null;
}) {
  if (error) {
    return <Alert>{error}</Alert>;
  }
  if (loading) {
    return <Text variant="muted">Loading workouts…</Text>;
  }
  if (workouts.length === 0) {
    return (
      <Card className="text-center">
        <Text variant="muted" className="mb-4">
          Your training log is empty.
        </Text>
        <Link href="/workouts/new">
          <Button>Add a workout</Button>
        </Link>
      </Card>
    );
  }
  return (
    <div className="grid gap-4">
      {workouts.map((w) => (
        <WorkoutCard key={w.id} workout={w} />
      ))}
    </div>
  );
}
