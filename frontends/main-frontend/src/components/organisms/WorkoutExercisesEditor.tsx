"use client";

import { FormEvent, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { ExerciseFormRow } from "@/components/molecules/ExerciseFormRow";
import { ApiError, workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import type { Exercise, Workout } from "@/lib/types";

const emptyExercise = (): Exercise => ({
  name: "",
  sets: undefined,
  reps: undefined,
  weightKg: undefined,
});

export function WorkoutExercisesEditor({
  workout,
  onSaved,
}: {
  workout: Workout;
  onSaved: (updated: Workout) => void;
}) {
  const [newRows, setNewRows] = useState<Exercise[]>([emptyExercise()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    const added = newRows.filter((ex) => ex.name.trim());
    if (added.length === 0) {
      setError("Enter at least one exercise name, or remove exercises from the list above.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const updated = await workoutApi.update(token, workout.id, {
        exercises: [...(workout.exercises ?? []), ...added],
      });
      setNewRows([emptyExercise()]);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save exercises");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-white/10 pt-6">
      <Text variant="caption">Add exercises</Text>
      {error && <Alert>{error}</Alert>}
      <div className="space-y-4">
        {newRows.map((ex, index) => (
          <ExerciseFormRow
            key={index}
            index={index}
            exercise={ex}
            onChange={(patch) =>
              setNewRows((prev) =>
                prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
              )
            }
            onRemove={() => setNewRows((prev) => prev.filter((_, i) => i !== index))}
            canRemove={newRows.length > 1}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setNewRows((p) => [...p, emptyExercise()])}
        >
          + Add another
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save exercises"}
        </Button>
      </div>
    </form>
  );
}
