"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { ApiError, workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import type { Exercise, Workout } from "@/lib/types";

export function WorkoutExerciseList({
  workout,
  onUpdated,
}: {
  workout: Workout;
  onUpdated: (workout: Workout) => void;
}) {
  const exercises = workout.exercises ?? [];
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(index: number) {
    const token = getAccessToken();
    if (!token) return;

    const target = exercises[index];
    if (!target) return;
    if (!confirm(`Remove "${target.name}" from this workout?`)) return;

    setError(null);
    setRemovingIndex(index);
    try {
      const next = exercises.filter((_, i) => i !== index);
      const updated = await workoutApi.update(token, workout.id, { exercises: next });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove exercise");
    } finally {
      setRemovingIndex(null);
    }
  }

  if (exercises.length === 0) {
    return <Text variant="muted">No exercises recorded.</Text>;
  }

  return (
    <div>
      {error && <Text className="mb-3 text-red-400">{error}</Text>}
      <ul className="divide-y divide-white/10">
        {exercises.map((ex, index) => (
          <li
            key={`${ex.name}-${index}`}
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <span className="font-medium">{ex.name}</span>
              <Text variant="muted" className="mt-1 block">
                {[ex.sets != null && `${ex.sets} sets`, ex.reps != null && `${ex.reps} reps`, ex.weightKg != null && `${ex.weightKg} kg`]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Text>
            </div>
            <Button
              variant="ghost"
              type="button"
              className="shrink-0 text-red-400"
              disabled={removingIndex !== null}
              onClick={() => handleRemove(index)}
            >
              {removingIndex === index ? "Removing…" : "Remove"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
