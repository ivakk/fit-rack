import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { Workout } from "@/lib/types";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function WorkoutCard({ workout }: { workout: Workout }) {
  const exerciseCount = workout.exercises?.length ?? 0;

  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="card group block transition hover:border-accent/30 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <Text variant="h3" className="group-hover:text-accent-glow">
            {workout.title}
          </Text>
          <Text variant="muted" className="mt-1">
            {formatDate(workout.performedAt ?? workout.createdAt)}
            {workout.durationMinutes ? ` · ${workout.durationMinutes} min` : ""}
          </Text>
        </div>
        <Badge>
          {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"}
        </Badge>
      </div>
      {workout.notes && (
        <Text variant="muted" className="mt-3 line-clamp-2">
          {workout.notes}
        </Text>
      )}
    </Link>
  );
}
