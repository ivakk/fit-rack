"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { ApiError, workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import { WorkoutExerciseList } from "@/components/molecules/WorkoutExerciseList";
import { WorkoutExercisesEditor } from "@/components/organisms/WorkoutExercisesEditor";
import type { Workout } from "@/lib/types";

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function WorkoutDetail({
  workout,
  loading,
  error,
  onWorkoutUpdated,
}: {
  workout: Workout | null;
  loading: boolean;
  error: string | null;
  onWorkoutUpdated?: (workout: Workout) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    const token = getAccessToken();
    if (!token || !workout) return;
    if (!confirm("Delete this workout?")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await workoutApi.remove(token, workout.id);
      router.push("/workouts");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (loading) return <Text variant="muted">Loading…</Text>;
  if (error) return <Text className="text-red-400">{error}</Text>;
  if (!workout) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text variant="h1">{workout.title}</Text>
          <Text variant="muted" className="mt-2">
            {formatDateTime(workout.performedAt ?? workout.createdAt)}
            {workout.durationMinutes ? ` · ${workout.durationMinutes} minutes` : ""}
          </Text>
        </div>
        <Button variant="danger" type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>
      {deleteError && <Text className="text-red-400">{deleteError}</Text>}
      {workout.notes && (
        <Card>
          <Text variant="caption">Notes</Text>
          <Text className="mt-2">{workout.notes}</Text>
        </Card>
      )}
      <Card>
        <Text variant="caption" className="mb-4">
          Exercises
        </Text>
        {onWorkoutUpdated ? (
          <WorkoutExerciseList workout={workout} onUpdated={onWorkoutUpdated} />
        ) : workout.exercises?.length ? (
          <ul className="divide-y divide-white/10">
            {workout.exercises.map((ex, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <span className="font-medium">{ex.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Text variant="muted">No exercises recorded.</Text>
        )}
        {onWorkoutUpdated && (
          <WorkoutExercisesEditor workout={workout} onSaved={onWorkoutUpdated} />
        )}
      </Card>
    </div>
  );
}
