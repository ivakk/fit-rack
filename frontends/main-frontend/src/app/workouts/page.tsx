"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { WorkoutList } from "@/components/organisms/WorkoutList";
import { AppTemplate } from "@/components/templates/AppTemplate";
import { workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import type { Workout } from "@/lib/types";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    workoutApi
      .list(token)
      .then(setWorkouts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppTemplate>
      <div className="flex items-center justify-between gap-4">
        <Text variant="h1">Workouts</Text>
        <Link href="/workouts/new">
          <Button>+ New workout</Button>
        </Link>
      </div>
      <div className="mt-8">
        <WorkoutList workouts={workouts} loading={loading} error={error} />
      </div>
    </AppTemplate>
  );
}
