"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Label } from "@/components/atoms/Label";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import { ExerciseFormRow } from "@/components/molecules/ExerciseFormRow";
import { ApiError, workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import type { Exercise } from "@/lib/types";

const emptyExercise = (): Exercise => ({
  name: "",
  sets: undefined,
  reps: undefined,
  weightKg: undefined,
});

export function WorkoutCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setError(null);
    setSubmitting(true);
    try {
      const created = await workoutApi.create(token, {
        title,
        notes: notes || undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        performedAt: new Date().toISOString(),
        exercises: exercises.filter((ex) => ex.name.trim()),
      });
      router.push(`/workouts/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save workout");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl space-y-6">
      {error && <Alert>{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Upper body strength"
          required
        />
        <FormField
          id="duration"
          label="Duration (minutes)"
          type="number"
          min={1}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />
        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={3}
            className="input-field resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel?"
          />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Text variant="caption">Exercises</Text>
            <Button variant="ghost" type="button" onClick={() => setExercises((p) => [...p, emptyExercise()])}>
              + Add exercise
            </Button>
          </div>
          <div className="space-y-4">
            {exercises.map((ex, index) => (
              <ExerciseFormRow
                key={index}
                index={index}
                exercise={ex}
                onChange={(patch) =>
                  setExercises((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
                  )
                }
                onRemove={() => setExercises((prev) => prev.filter((_, i) => i !== index))}
                canRemove={exercises.length > 1}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save workout"}
          </Button>
          <Link href="/workouts">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
