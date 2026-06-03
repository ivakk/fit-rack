"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkoutDetail } from "@/components/organisms/WorkoutDetail";
import { AppTemplate } from "@/components/templates/AppTemplate";
import { workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import type { Workout } from "@/lib/types";

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    setLoading(true);
    workoutApi
      .get(token, id)
      .then(setWorkout)
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppTemplate>
      <Link href="/workouts" className="text-sm text-muted hover:text-accent-glow">
        ← All workouts
      </Link>
      <div className="mt-6">
        <WorkoutDetail workout={workout} loading={loading} error={error} />
      </div>
    </AppTemplate>
  );
}
