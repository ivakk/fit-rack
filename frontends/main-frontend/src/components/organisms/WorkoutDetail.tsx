"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { ApiError, workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import type { Workout } from "@/lib/types";

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function WorkoutDetail({
  workout,
  loading,
  error,
}: {
  workout: Workout | null;
  loading: boolean;
  error: string | null;
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
        {workout.exercises?.length ? (
          <ul className="divide-y divide-white/10">
            {workout.exercises.map((ex, i) => (
              <li
                key={i}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <span className="font-medium">{ex.name}</span>
                <Text variant="muted">
                  {[ex.sets && `${ex.sets} sets`, ex.reps && `${ex.reps} reps`, ex.weightKg && `${ex.weightKg} kg`]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </Text>
              </li>
            ))}
          </ul>
        ) : (
          <Text variant="muted">No exercises recorded.</Text>
        )}
      </Card>
    </div>
  );
}
